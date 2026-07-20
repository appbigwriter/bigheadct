from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import Field, field_validator

from bighead_api.identity.models import ApiModel


class ExperimentPatchRequest(ApiModel):
    hypothesis: str | None = Field(default=None, min_length=1, max_length=10_000)
    variants: list[ExperimentVariantInput] | None = None
    stop_rule: dict[str, Any] | None = None
    window: dict[str, datetime | None] | None = None
    expected_updated_at: datetime


class ExperimentStartRequest(ApiModel):
    expected_updated_at: datetime


class ExperimentVariantInput(ApiModel):
    name: str = Field(min_length=1, max_length=160)
    content_asset_id: UUID | None = None
    weight: float = Field(gt=0, le=1)
    configuration: dict[str, Any] = Field(default_factory=dict)


class OrganizationPatchRequest(ApiModel):
    branding: dict[str, Any] | None = None
    domains: list[str] | None = Field(default=None, max_length=50)
    defaults: dict[str, Any] | None = None
    timezone: str | None = Field(default=None, min_length=1, max_length=64)
    expected_updated_at: datetime

    @field_validator("domains")
    @classmethod
    def valid_domains(cls, value: list[str] | None) -> list[str] | None:
        if value is not None and any(
            not domain or len(domain) > 253 or "." not in domain or "/" in domain
            for domain in value
        ):
            raise ValueError("domains must be DNS names")
        return value


class ExperimentPage(ApiModel):
    items: list[dict[str, Any]]
    counters: dict[str, int]
    next_cursor: str | None = None


class AuditPage(ApiModel):
    events: list[dict[str, Any]]
    privacy_jobs: list[dict[str, Any]] = Field(default_factory=list)
    next_cursor: str | None = None


class AnalyticsPeriod(ApiModel):
    start: datetime = Field(alias="from")
    end: datetime = Field(alias="to")
    boundary: Literal["[from,to)"]


class AnalyticsSummaryFilters(ApiModel):
    cards: list[str] = Field(default_factory=list)


class AnalyticsSummaryCard(ApiModel):
    key: str
    value: int
    source: Literal["tasks.created_at"]
    period: AnalyticsPeriod
    timezone: str
    freshness: datetime | None = None


class AnalyticsSummaryDrilldown(ApiModel):
    card: Literal["total"]
    dimension: str
    value: int
    record_ids: list[UUID]
    record_count: int
    records_truncated: bool
    records_endpoint: Literal["/v1/analytics/summary/records"]


class AnalyticsSummaryRecord(ApiModel):
    id: UUID
    status: str
    created_at: datetime


class AnalyticsSummaryRecordPage(ApiModel):
    items: list[AnalyticsSummaryRecord]
    total: int
    next_cursor: str | None = None


class AnalyticsSummaryReconciliation(ApiModel):
    card: Literal["total"]
    card_value: int
    drilldown_value: int
    reconciled: bool


class AnalyticsSummaryResponse(ApiModel):
    cards: list[AnalyticsSummaryCard]
    drilldowns: list[AnalyticsSummaryDrilldown]
    alerts: list[dict[str, Any]]
    source: list[Literal["tasks"]]
    period: AnalyticsPeriod
    timezone: str
    freshness: datetime | None = None
    calculated_at: datetime
    filters: AnalyticsSummaryFilters
    reconciliation: AnalyticsSummaryReconciliation


class PrivacyRequestCreateRequest(ApiModel):
    subject_user_id: UUID
    request_type: Literal["export", "anonymize", "delete"]


class LegalHoldCreateRequest(ApiModel):
    subject_user_id: UUID
    reason: str = Field(min_length=3, max_length=2_000)


class RetentionPolicyRequest(ApiModel):
    audit_days: int = Field(ge=365, le=36500)
    analytics_days: int = Field(ge=30, le=36500)


class ProjectSummary(ApiModel):
    id: UUID
    organization_id: UUID | None = None
    name: str
    slug: str
    business_type: str
    template_key: str
    schema_name: str
    domain: str | None = None
    language: str
    status: str
    template_version: str
    description: str | None = None
    created_at: datetime
    updated_at: datetime


class ProjectListResponse(ApiModel):
    items: list[ProjectSummary]
    counters: dict[str, int] = Field(default_factory=dict)


class ProjectCreateRequest(ApiModel):
    name: str = Field(min_length=2, max_length=160)
    slug: str = Field(min_length=2, max_length=63)
    business_type: str = Field(default="custom", max_length=32)
    template_key: str = Field(default="custom_base", max_length=64)
    domain: str | None = Field(default=None, max_length=253)
    language: str = Field(default="pt", max_length=16)
    description: str | None = Field(default=None, max_length=500)


class ProjectPatchRequest(ApiModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    domain: str | None = Field(default=None, max_length=253)
    language: str | None = Field(default=None, max_length=16)
    status: str | None = Field(default=None, max_length=32)
    description: str | None = Field(default=None, max_length=500)


class TeamParticipantInput(ApiModel):
    kind: Literal["human", "agent"]
    participant_id: UUID | None = None
    display_name: str = Field(min_length=1, max_length=160)
    email: str | None = Field(default=None, max_length=320)


class TeamSummary(ApiModel):
    id: UUID
    name: str
    slug: str
    description: str | None = None
    status: str
    organization_ids: list[UUID] = Field(default_factory=list)
    project_ids: list[UUID] = Field(default_factory=list)
    participants: list[TeamParticipantInput] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class TeamListResponse(ApiModel):
    items: list[TeamSummary]
    counters: dict[str, int] = Field(default_factory=dict)


class TeamCreateRequest(ApiModel):
    name: str = Field(min_length=2, max_length=160)
    slug: str = Field(min_length=2, max_length=63)
    description: str | None = Field(default=None, max_length=500)
    organization_ids: list[UUID] = Field(default_factory=list, max_length=100)
    project_ids: list[UUID] = Field(default_factory=list, max_length=100)
    participants: list[TeamParticipantInput] = Field(default_factory=list, max_length=100)


class TeamPatchRequest(ApiModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    slug: str | None = Field(default=None, min_length=2, max_length=63)
    description: str | None = Field(default=None, max_length=500)
    status: str | None = Field(default=None, max_length=32)
    organization_ids: list[UUID] | None = Field(default=None, max_length=100)
    project_ids: list[UUID] | None = Field(default=None, max_length=100)
    participants: list[TeamParticipantInput] | None = Field(default=None, max_length=100)


AnalyticsView = Literal["summary", "operations", "agents", "costs", "funnel"]
AttributionModel = Literal["first_touch", "last_touch", "linear"]
CostGroup = Literal["currency", "provider", "model", "agent", "day"]
IntegrationStatus = Literal["all", "enabled", "disabled", "degraded"]


class PeriodQuery(ApiModel):
    start: datetime
    end: datetime

    @field_validator("end")
    @classmethod
    def sensible_end(cls, value: datetime) -> datetime:
        return value
