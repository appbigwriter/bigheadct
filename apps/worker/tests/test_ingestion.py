import hashlib
from unittest.mock import AsyncMock
from uuid import UUID

import httpx
import pytest
from bighead_pycore import AnythingLlmClient
from bighead_worker.ingestion import AnythingLlmIngestion, dispatch_anything_llm_ingestions
from bighead_worker.jobs import dispatch_anything_llm_ingestions_job

ARTIFACT_ID = UUID("10000000-0000-0000-0000-000000000001")
LEASE_TOKEN = UUID("20000000-0000-0000-0000-000000000001")


class Store:
    def __init__(self) -> None:
        self.claimed = 0
        self.acks: list[tuple[UUID, str, UUID, str]] = []
        self.nacks: list[tuple[object, ...]] = []

    async def claim(self, worker: str, limit: int, lease_seconds: int):
        self.claimed += 1
        return [
            AnythingLlmIngestion(
                ARTIFACT_ID,
                UUID("30000000-0000-0000-0000-000000000001"),
                "tenant-derived-slug",
                "policy.pdf",
                "artifacts",
                "tenant/user/artifact/policy.pdf",
                hashlib.sha256(b"policy").hexdigest(),
                1,
                LEASE_TOKEN,
            )
        ]

    async def signed_download(self, bucket: str, path: str) -> str:
        return "https://storage.test/signed"

    async def ack(self, artifact_id, worker, lease_token, external_document_id):
        self.acks.append((artifact_id, worker, lease_token, external_document_id))
        return True

    async def nack(self, *args):
        self.nacks.append(args)
        return True


@pytest.mark.asyncio
async def test_dispatch_downloads_signed_artifact_and_propagates_fencing_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    store = Store()
    client = AsyncMock(spec=AnythingLlmClient)
    client.upload_document.return_value = "custom-documents/policy.pdf"
    response = httpx.Response(200, content=b"policy", request=httpx.Request("GET", "https://x"))
    get = AsyncMock(return_value=response)
    monkeypatch.setattr(httpx.AsyncClient, "get", get)

    assert await dispatch_anything_llm_ingestions(store, client, worker="worker-a") == (1, 0)
    client.update_embeddings.assert_awaited_once_with(
        "tenant-derived-slug", adds=["custom-documents/policy.pdf"], deletes=[]
    )
    assert store.acks == [
        (ARTIFACT_ID, "worker-a", LEASE_TOKEN, "custom-documents/policy.pdf")
    ]
    assert store.nacks == []


@pytest.mark.asyncio
async def test_provider_failure_nacks_with_same_fencing_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    store = Store()
    client = AsyncMock(spec=AnythingLlmClient)
    response = httpx.Response(200, content=b"policy", request=httpx.Request("GET", "https://x"))
    monkeypatch.setattr(httpx.AsyncClient, "get", AsyncMock(return_value=response))
    client.upload_document.side_effect = RuntimeError("provider unavailable")

    assert await dispatch_anything_llm_ingestions(store, client, worker="worker-a") == (0, 1)
    assert store.nacks[0][0:3] == (ARTIFACT_ID, "worker-a", LEASE_TOKEN)


@pytest.mark.asyncio
async def test_checksum_mismatch_fails_before_external_upload(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    store = Store()
    client = AsyncMock(spec=AnythingLlmClient)
    response = httpx.Response(200, content=b"tampered", request=httpx.Request("GET", "https://x"))
    monkeypatch.setattr(httpx.AsyncClient, "get", AsyncMock(return_value=response))

    assert await dispatch_anything_llm_ingestions(store, client, worker="worker-a") == (0, 1)
    client.upload_document.assert_not_awaited()
    assert store.nacks[0][0:3] == (ARTIFACT_ID, "worker-a", LEASE_TOKEN)


@pytest.mark.asyncio
async def test_cron_fails_closed_without_provider_before_claiming() -> None:
    store = Store()
    with pytest.raises(RuntimeError, match="not configured"):
        await dispatch_anything_llm_ingestions_job(
            {"settings": object(), "worker_id": "worker-a", "anything_llm_ingestion_store": store}
        )
    assert store.claimed == 0
