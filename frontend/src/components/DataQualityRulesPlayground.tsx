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
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const stages = [
    "Configure",
    "Generate",
    "Review",
    "Execute",
    "Results",
  ] as const;

  const activeStageIndex = useMemo(() => {
    if (completedExecution) {
      return 4;
    }

    if (isExecuting) {
      return 3;
    }

    if (execution) {
      return 2;
    }

    if (isSubmitting) {
      return 1;
    }

    return 0;
  }, [completedExecution, execution, isExecuting, isSubmitting]);

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
    setCopyState("idle");

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

    if (
      parsedRecords.some(
        (item) => item === null || typeof item !== "object" || Array.isArray(item),
      )
    ) {
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

  async function handleCopyExecutionId() {
    if (!completedExecution) {
      return;
    }

    try {
      await navigator.clipboard.writeText(completedExecution.executionId);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  function handleResetForNewExecution() {
    setExecution(null);
    setCompletedExecution(null);
    setRuleDecisions({});
    setValidationError(null);
    setBackendError(null);
    setCopyState("idle");
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5 sm:p-10">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Data quality rules playground
        </h2>
        <p className="mt-3 text-base leading-7 text-zinc-600">
          Describe dataset intent in natural language, generate structured candidate
          rules, review them, and execute only approved rules through deterministic
          logic.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700">
          Provider: Mock (deterministic)
        </div>
      </header>

      <ol className="sticky top-20 z-10 mt-8 grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/95 p-3 shadow-sm backdrop-blur sm:grid-cols-5">
        {stages.map((stage, index) => {
          const isDone = index < activeStageIndex;
          const isActive = index === activeStageIndex;
          return (
            <li
              key={stage}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                isActive
                  ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                  : isDone
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-bold">
                {isDone ? "OK" : index + 1}
              </span>
              {stage}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <label
              htmlFor="dataset-columns"
              className="block text-sm font-semibold text-zinc-800"
            >
              Dataset columns
            </label>
            <p className="mt-2 text-sm text-zinc-500">
              Required. Enter columns separated by commas or new lines.
            </p>
            <textarea
              id="dataset-columns"
              value={datasetColumnsInput}
              onChange={(event) => setDatasetColumnsInput(event.target.value)}
              className="mt-3 min-h-24 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="customer_id, email, signup_date"
            />
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <label
              htmlFor="requirements"
              className="block text-sm font-semibold text-zinc-800"
            >
              Business requirements
            </label>
            <p className="mt-2 text-sm text-zinc-500">
              Required. Describe expected data-quality rules in natural language.
            </p>
            <textarea
              id="requirements"
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              className="mt-3 min-h-32 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              placeholder="Email must be present and valid; customer_id must be positive."
            />
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <label
              htmlFor="sample-records"
              className="block text-sm font-semibold text-zinc-800"
            >
              Sample records (JSON array)
            </label>
            <p className="mt-2 text-sm text-zinc-500">
              Used during execution. Provide a non-empty array of JSON objects.
            </p>
            <textarea
              id="sample-records"
              value={recordsInput}
              onChange={(event) => setRecordsInput(event.target.value)}
              className="mt-3 min-h-44 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              aria-describedby="sample-records-help"
              disabled={executionLocked}
            />
            <p id="sample-records-help" className="mt-2 text-xs text-zinc-500">
              Example deterministic checks: required, minimum, and postal-code format.
            </p>
          </div>

          {(validationError || backendError) && (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {validationError ?? backendError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-500">
              Flask remains the source of truth for request validation.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {executionLocked && (
                <button
                  type="button"
                  onClick={handleResetForNewExecution}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Generate new execution
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-w-56 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {isSubmitting
                  ? "Generating governed candidate rules..."
                  : "Generate candidate rules"}
              </button>
            </div>
          </div>
        </form>

        <aside className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            What happens next
          </h3>
          {!execution ? (
            <div className="space-y-3 text-sm leading-6 text-zinc-600">
              <p>
                Enter schema columns and requirements. AI proposes structured
                candidate rules, then a human approves or rejects them before
                deterministic execution.
              </p>
              <ol className="space-y-2">
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">1. Configure intent and schema</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">2. Generate candidate rules</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">3. Review and approve</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">4. Execute approved rules</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">5. Inspect quality scorecard</li>
              </ol>
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-6 text-zinc-600">
              <p>
                Execution created. Review candidate rules, then run deterministic
                validation on approved rules only.
              </p>
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                Status: {toStatusLabel(execution.status)} ({execution.status})
              </p>
            </div>
          )}
        </aside>
      </div>

      {isSubmitting && !execution && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2" aria-hidden="true">
          <div className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
          <div className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
        </div>
      )}

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
            <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              Awaiting approval: review candidate rules before deterministic execution.
            </p>
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

            {execution.candidateRules.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm text-zinc-700">
                No supported rules were generated for this request. Try requirements
                that map to supported deterministic checks such as required fields,
                minimum values, or postal-code format.
              </div>
            ) : (
              <ul className="space-y-4">
                {execution.candidateRules.map((rule) => {
                  const decision = ruleDecisions[rule.id] ?? "approved";
                  const isApproved = decision === "approved";
                  const confidencePercent = Math.round(rule.confidence * 100);

                  return (
                    <li
                      key={rule.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {rule.field}
                          </p>
                          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">
                            {rule.type}
                          </p>
                          <p className="text-base font-semibold text-zinc-900">
                            {rule.message}
                          </p>
                          <p className="text-sm text-zinc-600">
                            Severity: {rule.severity}
                            {typeof rule.value === "number" && ` · Value: ${rule.value}`}
                            {rule.format && ` · Format: ${rule.format}`}
                          </p>
                          <div>
                            <div className="flex items-center justify-between text-xs text-zinc-600">
                              <span>Confidence</span>
                              <span>{confidencePercent}%</span>
                            </div>
                            <div className="mt-1 h-2 rounded-full bg-zinc-200">
                              <div
                                className="h-full rounded-full bg-indigo-600"
                                style={{ width: `${confidencePercent}%` }}
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                          <p className="text-sm font-medium text-zinc-700">
                            Status: {isApproved ? "Approved" : "Rejected"}
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
                            {isApproved ? "Approved" : "Approve"}
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
                            {!isApproved ? "Rejected" : "Reject"}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
              Execute approved rules
            </h3>

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
            <section className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                    Quality scorecard
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Execution complete. Deterministic evaluation is locked for this
                    execution ID.
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    This score shows how many approved rule checks passed across all
                    sample records.
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                    Overall quality score
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-indigo-900">
                    {completedExecution.qualityScore}%
                  </p>
                </div>
              </div>

              <div className="h-2 rounded-full bg-zinc-200" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${completedExecution.qualityScore}%` }}
                />
              </div>

              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                    Provider
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.provider}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                    Capability version
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900">
                    {completedExecution.capabilityVersion}
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

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyExecutionId}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  Copy execution ID
                </button>
                {copyState === "copied" && (
                  <span className="text-sm text-emerald-700">Copied</span>
                )}
                {copyState === "failed" && (
                  <span className="text-sm text-red-700">Copy failed</span>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Rule results
                </h4>
                <ul className="space-y-2">
                  {completedExecution.ruleResults.map((result) => {
                    const totalChecks = result.passed + result.failed;
                    const passRate =
                      totalChecks > 0
                        ? Math.round((result.passed / totalChecks) * 100)
                        : 0;

                    return (
                      <li
                        key={result.ruleId}
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800"
                      >
                        <p className="font-medium text-zinc-900">
                          {result.ruleId} ({result.type} on {result.field})
                        </p>
                        <p className="mt-1 text-zinc-600">
                          Passed: {result.passed} · Failed: {result.failed}
                        </p>
                        <div className="mt-2 h-2 rounded-full bg-zinc-200" aria-hidden="true">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-zinc-600">Pass rate: {passRate}%</p>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Failed records
                </h4>
                {completedExecution.failedRecords.length ? (
                  <ul className="space-y-2">
                    {completedExecution.failedRecords.map((failed) => (
                      <li
                        key={`${failed.recordIndex}-${failed.failedRuleIds.join("-")}`}
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800"
                      >
                        Record index {failed.recordIndex} · Failed rules: {failed.failedRuleIds.join(", ")}
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
