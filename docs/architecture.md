# Trusted Data AI Studio Architecture

## 1. Context And Goals

Trusted Data AI Studio demonstrates a governed enterprise AI capability pattern. The goal is to show one complete vertical slice where:

- capabilities can be discovered in a marketplace UI
- candidate rules can be generated from schema and requirements
- humans approve or reject generated rules
- approved rules execute deterministically on sample records
- results are surfaced as a quality scorecard
- the same backend service is invoked by REST and MCP adapters

## Diagram Catalog

This document includes five diagrams in this order:

1. Component Diagram
2. Generation Request Sequence Diagram
3. Approval And Execution Sequence Diagram
4. MCP Invocation Sequence Diagram
5. State Lifecycle Diagram

## 2. Component Diagram

```mermaid
flowchart LR
    subgraph Frontend
        Browser[Browser]
        NextServer[Next.js Server Components]
        Playground[DataQualityRulesPlayground Client Component]
        RouteHandlers[Next.js Route Handlers]
    end

    subgraph Backend
        FlaskAPI[Flask Blueprints]
        ExecutionService[ExecutionService]
        Catalogue[Capability Catalogue]
        Provider[MockAIProvider]
        Repository[InMemoryExecutionRepository]
        Engine[DeterministicRuleEngine]
    end

    subgraph MCP
        AIClient[AI Client]
        FastMCP[FastMCP Tool Adapter]
    end

    Browser --> NextServer
    NextServer --> Playground
    Playground --> RouteHandlers
    RouteHandlers --> FlaskAPI
    FlaskAPI --> ExecutionService

    AIClient --> FastMCP
    FastMCP --> ExecutionService

    ExecutionService --> Catalogue
    ExecutionService --> Provider
    ExecutionService --> Repository
    ExecutionService --> Engine
```

## 3. Generation Request Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User Browser
    participant P as Playground (Client)
    participant NR as Next Route Handler
    participant FB as Flask Blueprint
    participant ES as ExecutionService
    participant MP as MockAIProvider
    participant REPO as InMemoryExecutionRepository

    U->>P: Submit dataset columns and requirements
    P->>NR: POST /api/capabilities/{id}/executions
    NR->>FB: POST /api/v1/capabilities/{id}/executions
    FB->>ES: create_execution(capability_id, body)
    ES->>MP: generate_rules(datasetColumns, requirements)
    MP-->>ES: candidateRules
    ES->>REPO: save(awaiting_approval execution)
    ES-->>FB: execution payload
    FB-->>NR: HTTP 201 + execution payload
    NR-->>P: HTTP 201 + execution payload
```

## 4. Approval And Execution Sequence Diagram

```mermaid
sequenceDiagram
    participant U as User Browser
    participant P as Playground (Client)
    participant NR as Next Route Handler
    participant FB as Flask Blueprint
    participant ES as ExecutionService
    participant REPO as InMemoryExecutionRepository
    participant ENG as DeterministicRuleEngine

    U->>P: Approve rules and submit sample records
    P->>NR: POST /api/executions/{executionId}/execute
    NR->>FB: POST /api/v1/executions/{executionId}/execute
    FB->>ES: execute_approved_rules(executionId, body)
    ES->>REPO: get(executionId)
    REPO-->>ES: awaiting_approval execution
    ES->>ENG: evaluate(approvedRules, records)
    ENG-->>ES: scorecard metrics
    ES->>REPO: save(completed execution + completionResult)
    ES-->>FB: completed scorecard payload
    FB-->>NR: HTTP 200 + scorecard payload
    NR-->>P: HTTP 200 + scorecard payload
```

## 5. MCP Invocation Sequence Diagram

```mermaid
sequenceDiagram
    participant C as MCP Client
    participant M as FastMCP Server Tool
    participant APP as Flask App Context
    participant ES as ExecutionService

    C->>M: generate_data_quality_rules(dataset_columns, requirements)
    M->>APP: enter app.app_context()
    M->>ES: create_execution("data-quality-rules", body)
    ES-->>M: execution payload
    M-->>C: tool response
```

## 6. State Lifecycle

```mermaid
stateDiagram-v2
    [*] --> awaiting_approval
    awaiting_approval --> completed: execute approved rules
    completed --> [*]
```

- New executions are persisted as awaiting_approval.
- Successful rule execution transitions status to completed.
- Re-execution of a completed execution returns execution_already_completed.

## 7. Dependency Direction

Dependency direction is strictly inward from adapters toward core orchestration:

- UI, REST handlers, and MCP adapter depend on ExecutionService
- ExecutionService depends on abstractions and deterministic collaborators:
  - capability catalogue lookup
  - provider abstraction
  - repository abstraction
  - rule engine
- Rule engine is independent of Flask, HTTP, and repository concerns

## 8. Error Boundaries

Frontend:
- client-side validation provides immediate feedback
- route handlers return structured backend_unavailable on network failures

REST boundary:
- Blueprints parse JSON and map domain exceptions to HTTP status codes
- structured error envelope with code and message

Service boundary:
- authoritative validation for generation and execution inputs
- lifecycle guardrails (unknown execution, already completed)

MCP boundary:
- tool catches known service errors and returns controlled readable failures

## 9. Test Strategy

Primary verification focuses on deterministic backend behavior using pytest:

- generation contract and validation
- execution persistence and retrieval
- deterministic evaluation for required, minimum, and format rules
- scorecard correctness and state transition constraints
- MCP tool tests for valid input, controlled invalid input, and service reuse

Current verified state: full backend suite passes with 24 tests.

## 10. Production Scaling Considerations

- replace in-memory repository with persistent data store
- add queue-based asynchronous execution for larger datasets
- introduce retries, idempotency keys, and timeout policies
- add authentication, authorization, and tenant isolation
- add provider routing, policy enforcement, and output validation
- add observability for latency, errors, usage, and cost telemetry
- introduce capability versioning and change-management workflows
