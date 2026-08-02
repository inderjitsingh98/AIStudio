import math
import re


CANADIAN_POSTAL_CODE_PATTERN = re.compile(
    r"^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$",
    re.IGNORECASE,
)


class RuleEngine:
    def evaluate(
        self,
        approved_rules: list[dict],
        records: list[dict],
    ) -> dict:
        total_checks = len(approved_rules) * len(records)

        rule_results = [
            {
                "ruleId": rule["id"],
                "field": rule["field"],
                "type": rule["type"],
                "passed": 0,
                "failed": 0,
            }
            for rule in approved_rules
        ]

        failed_records = []
        records_passed = 0
        passed_checks = 0

        for record_index, record in enumerate(records):
            failed_rule_ids = []

            for idx, rule in enumerate(approved_rules):
                passed = self._evaluate_rule(rule, record)

                if passed:
                    rule_results[idx]["passed"] += 1
                    passed_checks += 1
                else:
                    rule_results[idx]["failed"] += 1
                    failed_rule_ids.append(rule["id"])

            if failed_rule_ids:
                failed_records.append(
                    {
                        "recordIndex": record_index,
                        "failedRuleIds": failed_rule_ids,
                    }
                )
            else:
                records_passed += 1

        records_failed = len(records) - records_passed
        quality_score = round(
            (passed_checks / total_checks) * 100,
            2,
        )

        return {
            "recordsProcessed": len(records),
            "recordsPassed": records_passed,
            "recordsFailed": records_failed,
            "qualityScore": quality_score,
            "ruleResults": rule_results,
            "failedRecords": failed_records,
        }

    def _evaluate_rule(self, rule: dict, record: dict) -> bool:
        rule_type = rule.get("type")

        if rule_type == "required":
            return self._evaluate_required_rule(rule, record)

        if rule_type == "minimum":
            return self._evaluate_minimum_rule(rule, record)

        if rule_type == "format":
            return self._evaluate_format_rule(rule, record)

        return False

    def _evaluate_required_rule(self, rule: dict, record: dict) -> bool:
        field = rule.get("field")

        if field not in record:
            return False

        value = record.get(field)

        if value is None:
            return False

        if isinstance(value, str) and not value.strip():
            return False

        return True

    def _evaluate_minimum_rule(self, rule: dict, record: dict) -> bool:
        field = rule.get("field")

        if field not in record:
            return False

        value = record.get(field)
        minimum_value = rule.get("value")

        if isinstance(value, bool):
            return False

        if not isinstance(value, (int, float)):
            return False

        if not math.isfinite(float(value)):
            return False

        if isinstance(minimum_value, bool):
            return False

        if not isinstance(minimum_value, (int, float)):
            return False

        if not math.isfinite(float(minimum_value)):
            return False

        return float(value) >= float(minimum_value)

    def _evaluate_format_rule(self, rule: dict, record: dict) -> bool:
        field = rule.get("field")

        if field not in record:
            return False

        value = record.get(field)

        if not isinstance(value, str):
            return False

        if rule.get("format") == "canadian_postal_code":
            return bool(
                CANADIAN_POSTAL_CODE_PATTERN.match(
                    value.strip(),
                )
            )

        return False