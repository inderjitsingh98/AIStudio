from uuid import uuid4

from app.catalogue import get_capability_by_id
from app.providers.base import AIProvider


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


class ExecutionService:
    def __init__(self, provider: AIProvider):
        self.provider = provider

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

        return {
            "executionId": str(uuid4()),
            "status": "awaiting_approval",
            "capabilityId": capability_id,
            "capabilityVersion": "1.0.0",
            "provider": self.provider.name,
            "candidateRules": candidate_rules,
        }

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