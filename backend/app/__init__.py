from flask import Flask, jsonify


def create_app() -> Flask:
    app = Flask(__name__)

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