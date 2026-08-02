from app.providers.base import AIProvider


class MockAIProvider(AIProvider):
    name = "mock"

    def generate_rules(
        self,
        dataset_columns: list[str],
        requirements: str,
    ) -> list[dict]:
        normalized_columns = {
            column.strip().lower()
            for column in dataset_columns
        }
        normalized_requirements = requirements.lower()
        candidate_rules = []

        if (
            "email" in normalized_columns
            and (
                "required" in normalized_requirements
                or "mandatory" in normalized_requirements
            )
        ):
            candidate_rules.append(
                {
                    "id": "email-required",
                    "field": "email",
                    "type": "required",
                    "severity": "error",
                    "confidence": 0.99,
                    "message": "Email is required.",
                }
            )

        if (
            "age" in normalized_columns
            and (
                "negative" in normalized_requirements
                or "minimum" in normalized_requirements
                or "zero" in normalized_requirements
            )
        ):
            candidate_rules.append(
                {
                    "id": "age-minimum",
                    "field": "age",
                    "type": "minimum",
                    "value": 0,
                    "severity": "error",
                    "confidence": 0.97,
                    "message": "Age must be zero or greater.",
                }
            )

        if (
            "postal_code" in normalized_columns
            and "postal code" in normalized_requirements
        ):
            candidate_rules.append(
                {
                    "id": "postal-code-format",
                    "field": "postal_code",
                    "type": "format",
                    "format": "canadian_postal_code",
                    "severity": "error",
                    "confidence": 0.95,
                    "message": (
                        "Postal code must use a valid Canadian format."
                    ),
                }
            )

        return candidate_rules