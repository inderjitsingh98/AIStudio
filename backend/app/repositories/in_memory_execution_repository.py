from copy import deepcopy

from app.repositories.execution_repository import (
    ExecutionRepository,
)


class InMemoryExecutionRepository(ExecutionRepository):
    def __init__(self):
        self._executions: dict[str, dict] = {}

    def save(self, execution: dict) -> dict:
        execution_id = execution["executionId"]
        stored = deepcopy(execution)
        self._executions[execution_id] = stored
        return deepcopy(stored)

    def get(self, execution_id: str):
        execution = self._executions.get(execution_id)

        if execution is None:
            return None

        return deepcopy(execution)