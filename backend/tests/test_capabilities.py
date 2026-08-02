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