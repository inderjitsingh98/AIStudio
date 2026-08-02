def test_get_capabilities_returns_catalogue(client):
    response = client.get("/api/v1/capabilities")

    assert response.status_code == 200

    payload = response.get_json()

    assert payload is not None
    assert "capabilities" in payload
    assert len(payload["capabilities"]) == 3

    first_capability = payload["capabilities"][0]

    assert "id" in first_capability
    assert "name" in first_capability
    assert "description" in first_capability
    assert "type" in first_capability
    assert "category" in first_capability


def test_get_capability_by_id_returns_matching_capability(client):
    response = client.get(
        "/api/v1/capabilities/data-quality-rules"
    )

    assert response.status_code == 200

    payload = response.get_json()

    assert payload is not None
    assert payload["capability"]["id"] == "data-quality-rules"
    assert payload["capability"]["name"] == "Data Quality Rules"
    assert payload["capability"]["type"] == "Skill"
    assert payload["capability"]["category"] == "Data Governance"


def test_get_capability_by_id_returns_404_when_not_found(client):
    response = client.get(
        "/api/v1/capabilities/does-not-exist"
    )

    assert response.status_code == 404

    payload = response.get_json()

    assert payload is not None
    assert payload["error"]["code"] == "capability_not_found"
    assert (
        payload["error"]["message"]
        == "Capability 'does-not-exist' was not found."
    )    