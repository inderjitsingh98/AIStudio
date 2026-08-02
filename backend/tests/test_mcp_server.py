import pytest

from app.services.execution_service import ValidationError


def test_generate_data_quality_rules_returns_candidate_rules():
    from app.mcp import server

    response = server.generate_data_quality_rules(
        dataset_columns=["email", "age", "postal_code"],
        requirements=(
            "Email is mandatory, age cannot be negative, and postal code "
            "must be validated as a postal code."
        ),
    )

    assert response["executionId"]
    assert response["status"] == "awaiting_approval"
    assert response["capabilityId"] == "data-quality-rules"
    assert response["capabilityVersion"] == "1.0.0"
    assert response["provider"] == "mock"
    assert response["candidateRules"]


def test_generate_data_quality_rules_invalid_input_returns_controlled_error():
    from app.mcp import server

    with pytest.raises(ValueError) as error:
        server.generate_data_quality_rules(
            dataset_columns=[],
            requirements="Email is required.",
        )

    message = str(error.value)
    assert "validation_error" in message
    assert "datasetColumns" in message


def test_generate_data_quality_rules_uses_execution_service_path(monkeypatch):
    from app.mcp import server

    calls = {}

    def fake_create_execution(capability_id: str, body: dict):
        calls["capability_id"] = capability_id
        calls["body"] = body
        return {
            "executionId": "stub-execution",
            "status": "awaiting_approval",
            "capabilityId": capability_id,
            "capabilityVersion": "1.0.0",
            "provider": "mock",
            "candidateRules": [],
        }

    monkeypatch.setattr(
        server.execution_service,
        "create_execution",
        fake_create_execution,
    )

    response = server.generate_data_quality_rules(
        dataset_columns=["email"],
        requirements="Email is required.",
    )

    assert calls["capability_id"] == "data-quality-rules"
    assert calls["body"] == {
        "datasetColumns": ["email"],
        "requirements": "Email is required.",
    }
    assert response["executionId"] == "stub-execution"


def test_generate_data_quality_rules_translates_service_errors(monkeypatch):
    from app.mcp import server

    def raise_validation_error(capability_id: str, body: dict):
        raise ValidationError(
            "validation_error",
            "datasetColumns must be a non-empty array of non-empty strings.",
        )

    monkeypatch.setattr(
        server.execution_service,
        "create_execution",
        raise_validation_error,
    )

    with pytest.raises(ValueError) as error:
        server.generate_data_quality_rules(
            dataset_columns=["email"],
            requirements="Email is required.",
        )

    message = str(error.value)
    assert "validation_error" in message
    assert "datasetColumns" in message
