from mcp.server.fastmcp import FastMCP

from app import create_app
from app.services.execution_service import (
    ExecutionService,
    ExecutionServiceError,
)

mcp = FastMCP("trusted-data-ai-mcp")
app = create_app()
execution_service: ExecutionService = app.extensions[
    "execution_service"
]


def _generate_data_quality_rules_impl(
    dataset_columns: list[str],
    requirements: str
) -> dict:
    with app.app_context():
        return execution_service.create_execution(
            capability_id="data-quality-rules",
            body={
                "datasetColumns": dataset_columns,
                "requirements": requirements,
            },
        )


@mcp.tool()
def generate_data_quality_rules(
    dataset_columns: list[str],
    requirements: str,
) -> dict:
    """Generate candidate data-quality rules for one dataset using the data-quality-rules capability.

    Args:
        dataset_columns: Non-empty list of dataset column names.
        requirements: Non-empty natural-language requirements for rule generation.

    Returns:
        Execution-generation payload containing executionId, status, capabilityId,
        capabilityVersion, provider, and candidateRules.
    """
    try:
        return _generate_data_quality_rules_impl(
            dataset_columns=dataset_columns,
            requirements=requirements,
        )
    except ExecutionServiceError as error:
        raise ValueError(
            f"{error.code}: {error.message}"
        ) from None


if __name__ == "__main__":
    mcp.run()
