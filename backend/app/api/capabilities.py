from flask import Blueprint, jsonify

from app.catalogue.capabilities import (
    CAPABILITIES,
    get_capability_by_id as get_catalogue_capability_by_id,
)

capabilities_bp = Blueprint(
    "capabilities",
    __name__,
    url_prefix="/api/v1",
)


@capabilities_bp.get("/capabilities")
def get_capabilities():
    return jsonify({"capabilities": CAPABILITIES})


@capabilities_bp.get("/capabilities/<capability_id>")
def get_capability_by_id(capability_id: str):
    capability = get_catalogue_capability_by_id(capability_id)

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