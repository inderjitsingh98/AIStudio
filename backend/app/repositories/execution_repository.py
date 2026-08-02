from abc import ABC, abstractmethod


class ExecutionRepository(ABC):
    @abstractmethod
    def save(self, execution: dict) -> dict:
        raise NotImplementedError

    @abstractmethod
    def get(self, execution_id: str):
        raise NotImplementedError