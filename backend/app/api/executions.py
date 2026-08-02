from flask import Blueprint, jsonify, request

from app.providers.mock import MockAIProvider
from app.services.execution_service import (
    CapabilityNotExecutableError,
    CapabilityNotFoundError,
    ExecutionService,
    ValidationError,
)


executions_bp = Blueprint(
    "executions",
    __name__,
    url_prefix="/api/v1",
)


@executions_bp.post("/capabilities/<capability_id>/executions")
def create_execution(capability_id: str):
    if not request.is_json:
        return jsonify(
            {
                "error": {
                    "code": "validation_error",
                    "message": "Request body must be valid JSON.",
                }
            }
        ), 400

    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return jsonify(
            {
                "error": {
                    "code": "validation_error",
                    "message": "Request body must be valid JSON.",
                }
            }
        ), 400

    service = ExecutionService(provider=MockAIProvider())

    try:
        execution = service.create_execution(capability_id, body)
    except ValidationError as error:
        return jsonify(
            {
                "error": {
                    "code": error.code,
                    "message": error.message,
                }
            }
        ), 400
    except CapabilityNotFoundError as error:
        return jsonify(
            {
                "error": {
                    "code": error.code,
                    "message": error.message,
                }
            }
        ), 404
    except CapabilityNotExecutableError as error:
        return jsonify(
            {
                "error": {
                    "code": error.code,
                    "message": error.message,
                }
            }
        ), 400

    return jsonify(execution), 201