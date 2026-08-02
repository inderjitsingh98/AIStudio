export type ExecutionRequest = {
  datasetColumns: string[];
  requirements: string;
};

export type ExecuteApprovedRulesRequest = {
  approvedRuleIds: string[];
  records: Record<string, unknown>[];
};

export type CandidateRule = {
  id: string;
  field: string;
  type: "required" | "minimum" | "format";
  value?: number;
  format?: string;
  severity: string;
  confidence: number;
  message: string;
};

export type ExecutionResponse = {
  executionId: string;
  status: string;
  capabilityId: string;
  capabilityVersion: string;
  provider: string;
  candidateRules: CandidateRule[];
};

export type RuleResult = {
  ruleId: string;
  field: string;
  type: "required" | "minimum" | "format";
  passed: number;
  failed: number;
};

export type FailedRecord = {
  recordIndex: number;
  failedRuleIds: string[];
};

export type CompletedExecutionResponse = {
  executionId: string;
  status: "completed";
  capabilityId: string;
  capabilityVersion: string;
  provider: string;
  approvedRuleCount: number;
  recordsProcessed: number;
  recordsPassed: number;
  recordsFailed: number;
  qualityScore: number;
  ruleResults: RuleResult[];
  failedRecords: FailedRecord[];
  latencyMs: number;
  completedAt: string;
};

type ExecutionErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class ExecutionRequestError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ExecutionRequestError";
    this.code = code;
    this.status = status;
  }
}

export async function createCapabilityExecution(
  capabilityId: string,
  payload: ExecutionRequest,
): Promise<ExecutionResponse> {
  const response = await fetch(
    `/api/capabilities/${encodeURIComponent(capabilityId)}/executions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const body = (await response.json()) as ExecutionResponse | ExecutionErrorResponse;

  if (!response.ok) {
    const errorBody = body as ExecutionErrorResponse;
    throw new ExecutionRequestError(
      errorBody.error?.message ?? "Execution request failed.",
      errorBody.error?.code ?? "execution_request_failed",
      response.status,
    );
  }

  return body as ExecutionResponse;
}

export async function executeCapabilityExecution(
  executionId: string,
  payload: ExecuteApprovedRulesRequest,
): Promise<CompletedExecutionResponse> {
  const response = await fetch(
    `/api/executions/${encodeURIComponent(executionId)}/execute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const body = (await response.json()) as
    | CompletedExecutionResponse
    | ExecutionErrorResponse;

  if (!response.ok) {
    const errorBody = body as ExecutionErrorResponse;
    throw new ExecutionRequestError(
      errorBody.error?.message ?? "Execution request failed.",
      errorBody.error?.code ?? "execution_request_failed",
      response.status,
    );
  }

  return body as CompletedExecutionResponse;
}