from datetime import datetime, timezone
from time import perf_counter
from uuid import uuid4

from app.catalogue import get_capability_by_id
from app.engines.rule_engine import RuleEngine
from app.providers.base import AIProvider
from app.repositories.execution_repository import (
    ExecutionRepository,
)


class ExecutionServiceError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


class ValidationError(ExecutionServiceError):
    pass


class CapabilityNotFoundError(ExecutionServiceError):
    pass


class CapabilityNotExecutableError(ExecutionServiceError):
    pass


class ExecutionNotFoundError(ExecutionServiceError):
    pass


class ExecutionAlreadyCompletedError(ExecutionServiceError):
    pass


class ExecutionService:
    def __init__(
        self,
        provider: AIProvider,
        repository: ExecutionRepository,
        rule_engine: RuleEngine,
    ):
        self.provider = provider
        self.repository = repository
        self.rule_engine = rule_engine

    def create_execution(
        self,
        capability_id: str,
        body: dict,
    ) -> dict:
        capability = get_capability_by_id(capability_id)

        if capability is None:
            raise CapabilityNotFoundError(
                "capability_not_found",
                f"Capability '{capability_id}' was not found.",
            )

        if capability_id != "data-quality-rules":
            raise CapabilityNotExecutableError(
                "capability_not_executable",
                (
                    f"Capability '{capability_id}' cannot be executed "
                    "yet."
                ),
            )

        dataset_columns = body.get("datasetColumns")
        requirements = body.get("requirements")

        validated_columns = self._validate_dataset_columns(
            dataset_columns
        )
        validated_requirements = self._validate_requirements(
            requirements
        )

        candidate_rules = self.provider.generate_rules(
            validated_columns,
            validated_requirements,
        )

        execution = {
            "executionId": str(uuid4()),
            "status": "awaiting_approval",
            "capabilityId": capability_id,
            "capabilityVersion": "1.0.0",
            "provider": self.provider.name,
            "candidateRules": candidate_rules,
        }

        self.repository.save(execution)
        return execution

    def get_execution(self, execution_id: str) -> dict:
        execution = self.repository.get(execution_id)

        if execution is None:
            raise ExecutionNotFoundError(
                "execution_not_found",
                f"Execution '{execution_id}' was not found.",
            )

        return execution

    def execute_approved_rules(
        self,
        execution_id: str,
        body: dict,
    ) -> dict:
        stored_execution = self.repository.get(execution_id)

        if stored_execution is None:
            raise ExecutionNotFoundError(
                "execution_not_found",
                f"Execution '{execution_id}' was not found.",
            )

        if stored_execution.get("status") == "completed":
            raise ExecutionAlreadyCompletedError(
                "execution_already_completed",
                (
                    f"Execution '{execution_id}' has already completed "
                    "and cannot be executed again."
                ),
            )

        approved_rule_ids = body.get("approvedRuleIds")
        records = body.get("records")

        validated_approved_rule_ids = self._validate_approved_rule_ids(
            approved_rule_ids,
            stored_execution["candidateRules"],
        )
        validated_records = self._validate_records(records)

        approved_rule_map = {
            rule["id"]: rule
            for rule in stored_execution["candidateRules"]
        }
        approved_rules = [
            approved_rule_map[rule_id]
            for rule_id in validated_approved_rule_ids
        ]

        started_at = perf_counter()
        scorecard = self.rule_engine.evaluate(
            approved_rules,
            validated_records,
        )
        latency_ms = int(round((perf_counter() - started_at) * 1000))

        completed_result = {
            "executionId": stored_execution["executionId"],
            "status": "completed",
            "capabilityId": stored_execution["capabilityId"],
            "capabilityVersion": stored_execution["capabilityVersion"],
            "provider": stored_execution["provider"],
            "approvedRuleCount": len(validated_approved_rule_ids),
            "recordsProcessed": scorecard["recordsProcessed"],
            "recordsPassed": scorecard["recordsPassed"],
            "recordsFailed": scorecard["recordsFailed"],
            "qualityScore": scorecard["qualityScore"],
            "ruleResults": scorecard["ruleResults"],
            "failedRecords": scorecard["failedRecords"],
            "latencyMs": latency_ms,
            "completedAt": datetime.now(timezone.utc).isoformat(),
        }

        stored_execution["status"] = "completed"
        stored_execution["completionResult"] = completed_result
        self.repository.save(stored_execution)

        return completed_result

    def _validate_dataset_columns(
        self,
        dataset_columns,
    ) -> list[str]:
        if not isinstance(dataset_columns, list):
            raise ValidationError(
                "validation_error",
                "datasetColumns must be a non-empty array of non-empty strings.",
            )

        normalized_columns = []

        for column in dataset_columns:
            if not isinstance(column, str):
                raise ValidationError(
                    "validation_error",
                    "datasetColumns must be a non-empty array of non-empty strings.",
                )

            normalized_column = column.strip()

            if not normalized_column:
                raise ValidationError(
                    "validation_error",
                    "datasetColumns must be a non-empty array of non-empty strings.",
                )

            normalized_columns.append(normalized_column)

        if not normalized_columns:
            raise ValidationError(
                "validation_error",
                "datasetColumns must be a non-empty array of non-empty strings.",
            )

        return normalized_columns

    def _validate_requirements(self, requirements) -> str:
        if not isinstance(requirements, str):
            raise ValidationError(
                "validation_error",
                "requirements must be a non-empty string.",
            )

        normalized_requirements = requirements.strip()

        if not normalized_requirements:
            raise ValidationError(
                "validation_error",
                "requirements must be a non-empty string.",
            )

        return normalized_requirements

    def _validate_approved_rule_ids(
        self,
        approved_rule_ids,
        candidate_rules: list[dict],
    ) -> list[str]:
        if not isinstance(approved_rule_ids, list):
            raise ValidationError(
                "validation_error",
                "approvedRuleIds must be a non-empty array of unique non-empty strings.",
            )

        normalized_rule_ids = []

        for item in approved_rule_ids:
            if not isinstance(item, str):
                raise ValidationError(
                    "validation_error",
                    "approvedRuleIds must be a non-empty array of unique non-empty strings.",
                )

            normalized_value = item.strip()

            if not normalized_value:
                raise ValidationError(
                    "validation_error",
                    "approvedRuleIds must be a non-empty array of unique non-empty strings.",
                )

            normalized_rule_ids.append(normalized_value)

        if not normalized_rule_ids:
            raise ValidationError(
                "validation_error",
                "approvedRuleIds must be a non-empty array of unique non-empty strings.",
            )

        if len(set(normalized_rule_ids)) != len(normalized_rule_ids):
            raise ValidationError(
                "validation_error",
                "approvedRuleIds must be a non-empty array of unique non-empty strings.",
            )

        candidate_rule_ids = {
            rule["id"]
            for rule in candidate_rules
        }

        for rule_id in normalized_rule_ids:
            if rule_id not in candidate_rule_ids:
                raise ValidationError(
                    "validation_error",
                    "approvedRuleIds must contain only IDs from candidateRules.",
                )

        total_checks = len(normalized_rule_ids)

        if total_checks == 0:
            raise ValidationError(
                "validation_error",
                "approvedRuleIds must be a non-empty array of unique non-empty strings.",
            )

        return normalized_rule_ids

    def _validate_records(self, records) -> list[dict]:
        if not isinstance(records, list):
            raise ValidationError(
                "validation_error",
                "records must be a non-empty array of JSON objects.",
            )

        if not records:
            raise ValidationError(
                "validation_error",
                "records must be a non-empty array of JSON objects.",
            )

        normalized_records = []

        for item in records:
            if not isinstance(item, dict):
                raise ValidationError(
                    "validation_error",
                    "records must be a non-empty array of JSON objects.",
                )

            normalized_records.append(item)

        return normalized_records