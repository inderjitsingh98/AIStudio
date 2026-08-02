from flask import Flask, jsonify

from app.api.capabilities import capabilities_bp
from app.api.executions import executions_bp
from app.engines.rule_engine import RuleEngine
from app.providers.mock import MockAIProvider
from app.repositories.in_memory_execution_repository import (
    InMemoryExecutionRepository,
)
from app.services.execution_service import ExecutionService


def create_app() -> Flask:
    app = Flask(__name__)

    repository = InMemoryExecutionRepository()
    rule_engine = RuleEngine()
    provider = MockAIProvider()
    execution_service = ExecutionService(
        provider=provider,
        repository=repository,
        rule_engine=rule_engine,
    )
    app.extensions["execution_service"] = execution_service

    app.register_blueprint(capabilities_bp)
    app.register_blueprint(executions_bp)

    @app.get("/api/v1/health")
    def health():
        return jsonify(
            {
                "service": "trusted-data-ai-api",
                "status": "healthy",
                "version": "1.0.0",
            }
        )

    return app