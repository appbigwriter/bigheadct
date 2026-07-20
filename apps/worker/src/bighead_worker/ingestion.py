import hashlib
from dataclasses import dataclass
from typing import Any, Protocol
from urllib.parse import quote
from uuid import UUID

import httpx
from bighead_pycore import AnythingLlmClient, supabase_admin_headers


@dataclass(frozen=True)
class AnythingLlmIngestion:
    artifact_id: UUID
    organization_id: UUID
    workspace: str
    artifact_name: str
    storage_bucket: str
    storage_path: str
    checksum_sha256: str
    attempts: int
    lease_token: UUID


class AnythingLlmIngestionStore(Protocol):
    async def claim(
        self, worker: str, limit: int, lease_seconds: int
    ) -> list[AnythingLlmIngestion]: ...

    async def signed_download(self, bucket: str, path: str) -> str: ...

    async def ack(
        self, artifact_id: UUID, worker: str, lease_token: UUID, external_document_id: str
    ) -> bool: ...

    async def nack(
        self,
        artifact_id: UUID,
        worker: str,
        lease_token: UUID,
        error_code: str,
        error_message: str,
        max_attempts: int,
    ) -> bool: ...


@dataclass
class SupabaseAnythingLlmIngestionStore:
    base_url: str
    secret_key: str

    def _headers(self) -> dict[str, str]:
        return {**supabase_admin_headers(self.secret_key), "Content-Type": "application/json"}

    async def claim(
        self, worker: str, limit: int, lease_seconds: int
    ) -> list[AnythingLlmIngestion]:
        rows = await self._rpc(
            "claim_anything_llm_ingestions",
            {"p_worker": worker, "p_limit": limit, "p_lease_seconds": lease_seconds},
        )
        return [
            AnythingLlmIngestion(
                artifact_id=UUID(row["artifact_id"]),
                organization_id=UUID(row["organization_id"]),
                workspace=row["workspace"],
                artifact_name=row["artifact_name"],
                storage_bucket=row["storage_bucket"],
                storage_path=row["storage_path"],
                checksum_sha256=row["checksum_sha256"],
                attempts=row["attempts"],
                lease_token=UUID(row["lease_token"]),
            )
            for row in rows
        ]

    async def signed_download(self, bucket: str, path: str) -> str:
        encoded = quote(path, safe="/")
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{self.base_url}/storage/v1/object/sign/{bucket}/{encoded}",
                headers=self._headers(),
                json={"expiresIn": 300},
            )
        response.raise_for_status()
        signed_url = response.json().get("signedURL")
        if not isinstance(signed_url, str) or not signed_url:
            raise RuntimeError("Supabase Storage did not return a signed download URL")
        if signed_url.startswith("/object/"):
            return f"{self.base_url}/storage/v1{signed_url}"
        if signed_url.startswith("/"):
            return f"{self.base_url}{signed_url}"
        return signed_url

    async def ack(
        self, artifact_id: UUID, worker: str, lease_token: UUID, external_document_id: str
    ) -> bool:
        result = await self._rpc(
            "ack_anything_llm_ingestion",
            {
                "p_artifact_id": str(artifact_id),
                "p_worker": worker,
                "p_lease_token": str(lease_token),
                "p_external_document_id": external_document_id,
            },
        )
        return result is True

    async def nack(
        self,
        artifact_id: UUID,
        worker: str,
        lease_token: UUID,
        error_code: str,
        error_message: str,
        max_attempts: int,
    ) -> bool:
        result = await self._rpc(
            "nack_anything_llm_ingestion",
            {
                "p_artifact_id": str(artifact_id),
                "p_worker": worker,
                "p_lease_token": str(lease_token),
                "p_error_code": error_code,
                "p_error_message": error_message,
                "p_max_attempts": max_attempts,
            },
        )
        return result is True

    async def _rpc(self, function: str, payload: dict[str, object]) -> Any:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.base_url}/rest/v1/rpc/{function}", headers=self._headers(), json=payload
            )
        response.raise_for_status()
        return response.json()


async def dispatch_anything_llm_ingestions(
    store: AnythingLlmIngestionStore,
    client: AnythingLlmClient,
    *,
    worker: str,
    lease_seconds: int = 120,
    limit: int = 10,
    max_attempts: int = 8,
) -> tuple[int, int]:
    ingestions = await store.claim(worker, limit, lease_seconds)
    completed = 0
    failed = 0
    for ingestion in ingestions:
        try:
            download_url = await store.signed_download(
                ingestion.storage_bucket, ingestion.storage_path
            )
            async with httpx.AsyncClient(timeout=60) as http_client:
                response = await http_client.get(download_url)
            response.raise_for_status()
            if hashlib.sha256(response.content).hexdigest() != ingestion.checksum_sha256:
                raise RuntimeError("downloaded artifact checksum does not match the clean record")
            location = await client.upload_document(response.content, ingestion.artifact_name)
            await client.update_embeddings(ingestion.workspace, adds=[location], deletes=[])
            if not await store.ack(
                ingestion.artifact_id, worker, ingestion.lease_token, location
            ):
                raise RuntimeError("AnythingLLM ingestion lease was lost before acknowledgement")
            completed += 1
        except Exception as exc:
            await store.nack(
                ingestion.artifact_id,
                worker,
                ingestion.lease_token,
                type(exc).__name__.upper(),
                str(exc),
                max_attempts,
            )
            failed += 1
    return completed, failed
