from flask import Blueprint, jsonify


capabilities_bp = Blueprint(
    "capabilities",
    __name__,
    url_prefix="/api/v1",
)


CAPABILITIES = [
    {
        "id": "data-quality-rules",
        "name": "Data Quality Rules",
        "description": (
            "Generate, validate, and execute reusable "
            "data quality rules."
        ),
        "type": "Skill",
        "category": "Data Governance",
    },
    {
        "id": "data-quality-scorecard",
        "name": "Data Quality Scorecard",
        "description": (
            "Measure completeness, validity, consistency, "
            "and uniqueness."
        ),
        "type": "App",
        "category": "Data Observability",
    },
    {
        "id": "data-lineage-explorer",
        "name": "Data Lineage Explorer",
        "description": (
            "Understand how enterprise data moves "
            "between systems."
        ),
        "type": "Agent",
        "category": "Data Intelligence",
    },
]


@capabilities_bp.get("/capabilities")
def get_capabilities():
    return jsonify({"capabilities": CAPABILITIES})

@capabilities_bp.get("/capabilities/<capability_id>")
def get_capability_by_id(capability_id: str):
    capability = next(
        (
            item
            for item in CAPABILITIES
            if item["id"] == capability_id
        ),
        None,
    )

    if capability is None:
        return jsonify(
            {
                "error": {
                    "code": "capability_not_found",
                    "message": (
                        f"Capability '{capability_id}' was not found."
                    ),
                }
            }
        ), 404

    return jsonify({"capability": capability})