"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  createCapabilityExecution,
  executeCapabilityExecution,
  type CompletedExecutionResponse,
  type ExecutionResponse,
  ExecutionRequestError,
} from "@/lib/api/executions";

type RuleDecision = "approved" | "rejected";

type DataQualityRulesPlaygroundProps = {
  capabilityId: string;
};

const DEFAULT_RECORDS_INPUT = JSON.stringify(
  [
    {
      customer_id: "1001",
      email: "john@example.com",
      age: 32,
      postal_code: "K1A 0B1",
    },
    {
      customer_id: "1002",
      email: "",
      age: -4,
      postal_code: "111 111",
    },
  ],
  null,
  2,
);

function toStatusLabel(status: string): string {
  if (status === "awaiting_approval") {
    return "Awaiting approval";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function DataQualityRulesPlayground({
  capabilityId,
}: DataQualityRulesPlaygroundProps) {
  const [datasetColumnsInput, setDatasetColumnsInput] = useState("");
  const [requirements, setRequirements] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [execution, setExecution] = useState<ExecutionResponse | null>(null);
  const [completedExecution, setCompletedExecution] =
    useState<CompletedExecutionResponse | null>(null);
  const [ruleDecisions, setRuleDecisions] = useState<Record<string, RuleDecision>>(
    {},
  );
  const [recordsInput, setRecordsInput] = useState(DEFAULT_RECORDS_INPUT);

  const approvedCount = useMemo(() => {
    if (!execution) {
      return 0;
    }

    return execution.candidateRules.filter(
      (rule) => ruleDecisions[rule.id] === "approved",
    ).length;
  }, [execution, ruleDecisions]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);
    setBackendError(null);

    // Derive dataset columns only at submit time for fast local feedback.
    const datasetColumns = datasetColumnsInput
      .split(/[\n,]/)
      .map((column) => column.trim())
      .filter(Boolean);
    const normalizedRequirements = requirements.trim();

    if (!datasetColumns.length) {
      setValidationError(
        "Add at least one dataset column using commas or new lines.",
      );
      return;
    }

    if (!normalizedRequirements) {
      setValidationError("Requirements are required before generating rules.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCapabilityExecution(capabilityId, {
        datasetColumns,
        requirements: normalizedRequirements,
      });

      setExecution(result);
      setCompletedExecution(null);
      setRuleDecisions(
        Object.fromEntries(result.candidateRules.map((rule) => [rule.id, "approved"])),
      );
    } catch (error) {
      if (error instanceof ExecutionRequestError) {
        setBackendError(error.message);
      } else {
        setBackendError("Unable to execute capability right now. Try again shortly.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExecuteApprovedRules() {
    if (!execution) {
      return;
    }

    setValidationError(null);
    setBackendError(null);

    let parsedRecords: unknown;

    try {
      parsedRecords = JSON.parse(recordsInput);
    } catch {
      setValidationError("Records JSON must be valid JSON.");
      return;
    }

    if (!Array.isArray(parsedRecords) || !parsedRecords.length) {
      setValidationError("Records JSON must be a non-empty array of objects.");
      return;
    }

    if (parsedRecords.some((item) => item === null || typeof item !== "object" || Array.isArray(item))) {
      setValidationError("Every record must be a JSON object.");
      return;
    }

    const approvedRuleIds = execution.candidateRules
      .filter((rule) => ruleDecisions[rule.id] === "approved")
      .map((rule) => rule.id);

    if (!approvedRuleIds.length) {
      setValidationError("Approve at least one candidate rule before execution.");
      return;
    }

    setIsExecuting(true);

    try {
      const result = await executeCapabilityExecution(execution.executionId, {
        approvedRuleIds,
        records: parsedRecords as Record<string, unknown>[],
      });
      setCompletedExecution(result);
    } catch (error) {
      if (error instanceof ExecutionRequestError) {
        setBackendError(error.message);
      } else {
        setBackendError("Unable to execute approved rules right now. Try again shortly.");
      }
    } finally {
      setIsExecuting(false);
    }
  }

  const executionLocked =
    !!completedExecution &&
    !!execution &&
    completedExecution.executionId === execution.executionId;

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 sm:p-10">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Data quality rules playground
        </h2>
        <p className="mt-3 text-base leading-7 text-zinc-600">
          Submit a dataset shape and plain-language requirements to generate
          candidate validation rules.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="dataset-columns"
            className="block text-sm font-semibold text-zinc-800"
          >
            Dataset columns
          </label>
          <p className="mt-2 text-sm text-zinc-500">
            Enter columns separated by commas or new lines.
          </p>
          <textarea
            id="dataset-columns"
            value={datasetColumnsInput}
            onChange={(event) => setDatasetColumnsInput(event.target.value)}
            className="mt-3 min-h-24 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            placeholder="customer_id, email, signup_date"
          />
        </div>

        <div>
          <label
            htmlFor="requirements"
            className="block text-sm font-semibold text-zinc-800"
          >
            Requirements
          </label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
            className="mt-3 min-h-28 w-full rounded-2xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            placeholder="Email must be present and valid; customer_id must be positive."
          />
        </div>

        {(validationError || backendError) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {validationError ?? backendError}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            Flask remains the source of truth for request validation.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isSubmitting ? "Generating..." : "Generate candidate rules"}
          </button>
        </div>
      </form>

      {execution && (
        <div className="mt-10 space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
              Execution result
            </h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Execution ID
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-800">
                  {execution.executionId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Status
                </dt>
                <dd className="mt-1 text-sm text-zinc-800">
                  {toStatusLabel(execution.status)} ({execution.status})
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Capability
                </dt>
                <dd className="mt-1 text-sm text-zinc-800">
                  {execution.capabilityId}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Version / Provider
                </dt>
                <dd className="mt-1 text-sm text-zinc-800">
                  {execution.capabilityVersion} / {execution.provider}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                Candidate rules
              </h3>
              <p className="text-sm font-medium text-zinc-600">
                Approved {approvedCount} of {execution.candidateRules.length}
              </p>
            </div>

            <ul className="space-y-4">
              {execution.candidateRules.map((rule) => {
                const decision = ruleDecisions[rule.id] ?? "approved";
                const isApproved = decision === "approved";

                return (
                  <li
                    key={rule.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
                          {rule.type} · {rule.severity} · {Math.round(rule.confidence * 100)}%
                        </p>
                        <p className="text-base font-semibold text-zinc-900">
                          {rule.message}
                        </p>
                        <p className="text-sm text-zinc-600">
                          Field: {rule.field}
                          {typeof rule.value === "number" && ` · Value: ${rule.value}`}
                          {rule.format && ` · Format: ${rule.format}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-pressed={isApproved}
                          disabled={executionLocked}
                          onClick={() =>
                            setRuleDecisions((current) => ({
                              ...current,
                              [rule.id]: "approved",
                            }))
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 ${
                            isApproved
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          {isApproved ? "Approved" : "Mark approved"}
                        </button>
                        <button
                          type="button"
                          aria-pressed={!isApproved}
                          disabled={executionLocked}
                          onClick={() =>
                            setRuleDecisions((current) => ({
                              ...current,
                              [rule.id]: "rejected",
                            }))
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 ${
                            !isApproved
                              ? "border-red-300 bg-red-50 text-red-700"
                              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                          }`}
                        >
                          {!isApproved ? "Rejected" : "Mark rejected"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
              Execute approved rules
            </h3>
            <label
              htmlFor="sample-records"
              className="block text-sm font-semibold text-zinc-800"
            >
              Sample records (JSON array)
            </label>
            <textarea
              id="sample-records"
              value={recordsInput}
              onChange={(event) => setRecordsInput(event.target.value)}
              className="min-h-56 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              aria-describedby="sample-records-help"
              disabled={executionLocked}
            />
            <p id="sample-records-help" className="text-sm text-zinc-500">
              Provide a non-empty JSON array of record objects.
            </p>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-500">
                Only approved rules are sent for execution.
              </p>
              <button
                type="button"
                onClick={handleExecuteApprovedRules}
                disabled={isExecuting || executionLocked}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {executionLocked
                  ? "Execution completed"
                  : isExecuting
                    ? "Executing..."
                    : "Execute approved rules"}
              </button>
            </div>
          </section>

          {completedExecution && (
            <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                Quality scorecard
              </h3>

              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    Completed ({completedExecution.status})
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Quality score
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.qualityScore}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Records processed
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.recordsProcessed}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Records passed
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.recordsPassed}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Records failed
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.recordsFailed}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Approved rules
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.approvedRuleCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Execution ID
                  </dt>
                  <dd className="mt-1 break-all text-sm text-zinc-900">
                    {completedExecution.executionId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Completed at / Latency
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.completedAt} / {completedExecution.latencyMs} ms
                  </dd>
                </div>
              </dl>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Rule results
                </h4>
                <ul className="space-y-2">
                  {completedExecution.ruleResults.map((result) => (
                    <li key={result.ruleId} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
                      Rule {result.ruleId} ({result.type} on {result.field}) - Passed: {result.passed}, Failed: {result.failed}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Failed records
                </h4>
                {completedExecution.failedRecords.length ? (
                  <ul className="space-y-2">
                    {completedExecution.failedRecords.map((failed) => (
                      <li key={`${failed.recordIndex}-${failed.failedRuleIds.join("-")}`} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800">
                        Record index {failed.recordIndex} failed rules: {failed.failedRuleIds.join(", ")}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-700">All records passed every approved rule.</p>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}