export type ExecutionRequest = {
  datasetColumns: string[];
  requirements: string;
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