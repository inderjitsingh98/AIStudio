from flask import Flask, jsonify

from app.api.capabilities import capabilities_bp
from app.api.executions import executions_bp


def create_app() -> Flask:
    app = Flask(__name__)

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