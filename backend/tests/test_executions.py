def test_create_execution_returns_201_with_metadata_and_rules(client):
    response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        json={
            "datasetColumns": [
                "customer_id",
                "email",
                "age",
                "country",
            ],
            "requirements": (
                "Email is required and age cannot be negative."
            ),
        },
    )

    assert response.status_code == 201

    payload = response.get_json()

    assert payload is not None
    assert payload["executionId"]
    assert payload["status"] == "awaiting_approval"
    assert payload["capabilityId"] == "data-quality-rules"
    assert payload["capabilityVersion"] == "1.0.0"
    assert payload["provider"] == "mock"
    assert payload["candidateRules"] == [
        {
            "id": "email-required",
            "field": "email",
            "type": "required",
            "severity": "error",
            "confidence": 0.99,
            "message": "Email is required.",
        },
        {
            "id": "age-minimum",
            "field": "age",
            "type": "minimum",
            "value": 0,
            "severity": "error",
            "confidence": 0.97,
            "message": "Age must be zero or greater.",
        },
    ]


def test_create_execution_returns_400_for_missing_dataset_columns(client):
    response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        json={
            "requirements": "Email is required.",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload is not None
    assert payload["error"]["code"] == "validation_error"


def test_create_execution_returns_400_for_invalid_dataset_columns(client):
    response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        json={
            "datasetColumns": ["email", ""],
            "requirements": "Email is required.",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload is not None
    assert payload["error"]["code"] == "validation_error"


def test_create_execution_returns_400_for_missing_requirements(client):
    response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        json={
            "datasetColumns": ["email", "age"],
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload is not None
    assert payload["error"]["code"] == "validation_error"


def test_create_execution_returns_404_for_unknown_capability(client):
    response = client.post(
        "/api/v1/capabilities/does-not-exist/executions",
        json={
            "datasetColumns": ["email"],
            "requirements": "Email is required.",
        },
    )

    assert response.status_code == 404

    payload = response.get_json()

    assert payload is not None
    assert payload["error"]["code"] == "capability_not_found"


def test_create_execution_returns_400_for_non_executable_capability(client):
    response = client.post(
        "/api/v1/capabilities/data-quality-scorecard/executions",
        json={
            "datasetColumns": ["email"],
            "requirements": "Email is required.",
        },
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload is not None
    assert payload["error"]["code"] == "capability_not_executable"


def test_create_execution_returns_400_for_non_json_body(client):
    response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        data="not-json",
        content_type="text/plain",
    )

    assert response.status_code == 400

    payload = response.get_json()

    assert payload is not None
    assert payload["error"]["code"] == "validation_error"


def test_mock_provider_output_is_deterministic(client):
    request_payload = {
        "datasetColumns": ["email", "age", "postal_code"],
        "requirements": (
            "Email is mandatory, age cannot be negative, and postal code "
            "must be validated as a postal code."
        ),
    }

    first_response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        json=request_payload,
    )
    second_response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        json=request_payload,
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201

    first_payload = first_response.get_json()
    second_payload = second_response.get_json()

    assert first_payload is not None
    assert second_payload is not None
    assert (
        first_payload["candidateRules"]
        == second_payload["candidateRules"]
    )
    assert first_payload["candidateRules"] == [
        {
            "id": "email-required",
            "field": "email",
            "type": "required",
            "severity": "error",
            "confidence": 0.99,
            "message": "Email is required.",
        },
        {
            "id": "age-minimum",
            "field": "age",
            "type": "minimum",
            "value": 0,
            "severity": "error",
            "confidence": 0.97,
            "message": "Age must be zero or greater.",
        },
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
        },
    ]