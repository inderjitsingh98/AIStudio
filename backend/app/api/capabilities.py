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