from flask import Blueprint, current_app, jsonify, request

from app.services.execution_service import (
    ExecutionAlreadyCompletedError,
    CapabilityNotExecutableError,
    CapabilityNotFoundError,
    ExecutionService,
    ExecutionNotFoundError,
    ValidationError,
)


executions_bp = Blueprint(
    "executions",
    __name__,
    url_prefix="/api/v1",
)


@executions_bp.post("/capabilities/<capability_id>/executions")
def create_execution(capability_id: str):
    body, error_response = _parse_json_object()

    if error_response is not None:
        return error_response

    service = _get_execution_service()

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


@executions_bp.get("/executions/<execution_id>")
def get_execution(execution_id: str):
    service = _get_execution_service()

    try:
        execution = service.get_execution(execution_id)
    except ExecutionNotFoundError as error:
        return jsonify(
            {
                "error": {
                    "code": error.code,
                    "message": error.message,
                }
            }
        ), 404

    return jsonify(execution), 200


@executions_bp.post("/executions/<execution_id>/execute")
def execute_execution(execution_id: str):
    body, error_response = _parse_json_object()

    if error_response is not None:
        return error_response

    service = _get_execution_service()

    try:
        result = service.execute_approved_rules(execution_id, body)
    except ValidationError as error:
        return jsonify(
            {
                "error": {
                    "code": error.code,
                    "message": error.message,
                }
            }
        ), 400
    except ExecutionNotFoundError as error:
        return jsonify(
            {
                "error": {
                    "code": error.code,
                    "message": error.message,
                }
            }
        ), 404
    except ExecutionAlreadyCompletedError as error:
        return jsonify(
            {
                "error": {
                    "code": error.code,
                    "message": error.message,
                }
            }
        ), 409

    return jsonify(result), 200


def _get_execution_service() -> ExecutionService:
    return current_app.extensions["execution_service"]


def _parse_json_object():
    if not request.is_json:
        return None, (
            jsonify(
                {
                    "error": {
                        "code": "validation_error",
                        "message": "Request body must be valid JSON.",
                    }
                }
            ),
            400,
        )

    body = request.get_json(silent=True)

    if not isinstance(body, dict):
        return None, (
            jsonify(
                {
                    "error": {
                        "code": "validation_error",
                        "message": "Request body must be valid JSON.",
                    }
                }
            ),
            400,
        )

    return body, None