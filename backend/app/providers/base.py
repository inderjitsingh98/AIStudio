from abc import ABC, abstractmethod


class AIProvider(ABC):
    name = "base"

    @abstractmethod
    def generate_rules(
        self,
        dataset_columns: list[str],
        requirements: str,
    ) -> list[dict]:
        raise NotImplementedError