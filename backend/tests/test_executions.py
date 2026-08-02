def _create_data_quality_execution(client):
    response = client.post(
        "/api/v1/capabilities/data-quality-rules/executions",
        json={
            "datasetColumns": ["email", "age", "postal_code"],
            "requirements": (
                "Email is mandatory, age cannot be negative, and postal code "
                "must be validated as a postal code."
            ),
        },
    )

    assert response.status_code == 201
    payload = response.get_json()
    assert payload is not None
    return payload


def test_create_execution_returns_201_with_metadata_and_rules(client):
    payload = _create_data_quality_execution(client)

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


def test_generated_execution_is_stored_and_retrievable(client):
    created = _create_data_quality_execution(client)

    response = client.get(
        f"/api/v1/executions/{created['executionId']}"
    )

    assert response.status_code == 200
    payload = response.get_json()

    assert payload is not None
    assert payload["executionId"] == created["executionId"]
    assert payload["status"] == "awaiting_approval"
    assert payload["candidateRules"] == created["candidateRules"]


def test_execute_returns_completed_scorecard(client):
    created = _create_data_quality_execution(client)

    response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": [
                "email-required",
                "age-minimum",
            ],
            "records": [
                {
                    "customer_id": "1001",
                    "email": "john@example.com",
                    "age": 32,
                },
                {
                    "customer_id": "1002",
                    "email": "",
                    "age": -4,
                },
            ],
        },
    )

    assert response.status_code == 200
    payload = response.get_json()

    assert payload is not None
    assert payload["executionId"] == created["executionId"]
    assert payload["status"] == "completed"
    assert payload["capabilityId"] == "data-quality-rules"
    assert payload["capabilityVersion"] == "1.0.0"
    assert payload["provider"] == "mock"
    assert payload["approvedRuleCount"] == 2
    assert payload["recordsProcessed"] == 2
    assert payload["recordsPassed"] == 1
    assert payload["recordsFailed"] == 1
    assert payload["qualityScore"] == 50.0
    assert payload["latencyMs"] >= 0
    assert payload["completedAt"]
    assert payload["ruleResults"] == [
        {
            "ruleId": "email-required",
            "field": "email",
            "type": "required",
            "passed": 1,
            "failed": 1,
        },
        {
            "ruleId": "age-minimum",
            "field": "age",
            "type": "minimum",
            "passed": 1,
            "failed": 1,
        },
    ]
    assert payload["failedRecords"] == [
        {
            "recordIndex": 1,
            "failedRuleIds": [
                "email-required",
                "age-minimum",
            ],
        }
    ]


def test_required_rule_passes_and_fails_correctly(client):
    created = _create_data_quality_execution(client)

    response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": ["email-required"],
            "records": [
                {"email": "a@b.com"},
                {"email": "   "},
            ],
        },
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload is not None
    assert payload["ruleResults"][0]["passed"] == 1
    assert payload["ruleResults"][0]["failed"] == 1


def test_minimum_rule_passes_and_fails_correctly(client):
    created = _create_data_quality_execution(client)

    response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": ["age-minimum"],
            "records": [
                {"age": 3},
                {"age": -1},
                {"age": True},
                {"age": "5"},
            ],
        },
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload is not None
    assert payload["ruleResults"][0]["passed"] == 1
    assert payload["ruleResults"][0]["failed"] == 3


def test_canadian_postal_code_rule_passes_and_fails_correctly(client):
    created = _create_data_quality_execution(client)

    response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": ["postal-code-format"],
            "records": [
                {"postal_code": "K1A 0B1"},
                {"postal_code": "k1a0b1"},
                {"postal_code": "111 111"},
                {"postal_code": "D1A 0B1"},
            ],
        },
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload is not None
    assert payload["ruleResults"][0]["passed"] == 2
    assert payload["ruleResults"][0]["failed"] == 2


def test_scorecard_counts_and_quality_score_are_correct(client):
    created = _create_data_quality_execution(client)

    response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": [
                "email-required",
                "age-minimum",
                "postal-code-format",
            ],
            "records": [
                {
                    "email": "john@example.com",
                    "age": 30,
                    "postal_code": "K1A 0B1",
                },
                {
                    "email": "",
                    "age": -2,
                    "postal_code": "bad",
                },
            ],
        },
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload is not None
    assert payload["recordsProcessed"] == 2
    assert payload["recordsPassed"] == 1
    assert payload["recordsFailed"] == 1
    assert payload["qualityScore"] == 50.0


def test_get_execution_returns_404_for_unknown_execution_id(client):
    response = client.get(
        "/api/v1/executions/does-not-exist"
    )

    assert response.status_code == 404
    payload = response.get_json()
    assert payload is not None
    assert payload["error"]["code"] == "execution_not_found"


def test_execute_returns_400_for_invalid_approved_rule_ids(client):
    created = _create_data_quality_execution(client)

    response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": ["email-required", "email-required"],
            "records": [{"email": "john@example.com"}],
        },
    )

    assert response.status_code == 400
    payload = response.get_json()
    assert payload is not None
    assert payload["error"]["code"] == "validation_error"


def test_execute_returns_400_for_invalid_records(client):
    created = _create_data_quality_execution(client)

    response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": ["email-required"],
            "records": [],
        },
    )

    assert response.status_code == 400
    payload = response.get_json()
    assert payload is not None
    assert payload["error"]["code"] == "validation_error"


def test_completed_execution_cannot_be_executed_again(client):
    created = _create_data_quality_execution(client)

    first_response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": ["email-required"],
            "records": [{"email": "john@example.com"}],
        },
    )
    assert first_response.status_code == 200

    second_response = client.post(
        f"/api/v1/executions/{created['executionId']}/execute",
        json={
            "approvedRuleIds": ["email-required"],
            "records": [{"email": "john@example.com"}],
        },
    )

    assert second_response.status_code == 409
    payload = second_response.get_json()
    assert payload is not None
    assert payload["error"]["code"] == "execution_already_completed"


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