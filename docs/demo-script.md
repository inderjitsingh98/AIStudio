# Trusted Data AI Studio 8-Minute Interview Demo Script

## 0:00 to 0:45 - Problem and Value Proposition

What to click or run
- Open the repository root and show README.

What to say
- Data-quality rules are still often written manually.
- Unconstrained model-generated code is risky for enterprise governance.
- This prototype shows a governed capability lifecycle where AI proposes, humans approve, and deterministic systems execute.

Principal-level point being demonstrated
- Product framing is platform-oriented, not a one-off AI demo.

Fallback if live step fails
- Use the architecture diagram screenshot or markdown preview to explain the same value proposition.

## 0:45 to 1:30 - Architecture Overview

What to click or run
- Open docs/architecture.md and walk through the component and sequence diagrams.

What to say
- Browser traffic goes through Next.js route handlers to Flask REST.
- AI clients use FastMCP.
- Both REST and MCP call the same ExecutionService.

Principal-level point being demonstrated
- Shared business orchestration layer behind multiple protocol adapters.

Fallback if live step fails
- Explain using the responsibility table in README and point to backend/app/__init__.py wiring.

## 1:30 to 2:15 - Marketplace and Capability Discovery

What to click or run
- Start services if needed.
- Open http://localhost:3000.
- Open Data Quality Rules capability detail page.

What to say
- The marketplace is a capability discovery surface.
- We narrow to one deep vertical slice instead of broad shallow features.

Principal-level point being demonstrated
- Capability-product model with explicit scope boundaries.

Fallback if live step fails
- Show component files and route structure in frontend/src/app and frontend/src/components.

## 2:15 to 3:30 - Generate Three Candidate Rules

What to click or run
- On the capability page, enter dataset columns: customer_id, email, age, postal_code.
- Enter requirements: Email is required, age cannot be negative, and postal code must use a valid Canadian format.
- Click Generate candidate rules.

What to say
- Generation returns structured rule candidates, not executable code.
- The provider is deterministic mock logic for repeatable behavior and testing.

Principal-level point being demonstrated
- Controlled AI boundary with explicit schema and deterministic outputs.

Fallback if live step fails
- Run REST generation curl from README and show returned candidateRules payload.

## 3:30 to 4:15 - Human Approval and Reject One Rule

What to click or run
- Toggle rule decisions in the candidate list.
- Approve two rules and reject one.

What to say
- Human review is a mandatory governance gate.
- No rule execution happens before approval choices are made.

Principal-level point being demonstrated
- Human-in-the-loop control before runtime actions.

Fallback if live step fails
- Show button state logic in frontend/src/components/DataQualityRulesPlayground.tsx.

## 4:15 to 5:30 - Execute Against Sample Data and Explain Score

What to click or run
- Keep or paste the default sample JSON records.
- Click Execute approved rules.
- Show the scorecard panel.

What to say
- Quality score uses passed checks divided by records times approved rules, then multiplied by 100.
- Example shown produces 50 percent when half of checks pass.
- Record-level and rule-level failures are visible and auditable.

Principal-level point being demonstrated
- Deterministic execution and explainable scoring with transparent diagnostics.

Fallback if live step fails
- Execute via REST endpoint and walk through JSON response fields: qualityScore, ruleResults, failedRecords.

## 5:30 to 6:30 - MCP Inspector and Same Capability Invocation

What to click or run
- In backend:
  - source .venv/bin/activate
  - npx @modelcontextprotocol/inspector python -m app.mcp.server
- Invoke generate_data_quality_rules tool with dataset_columns and requirements.

What to say
- MCP is a thin adapter, not duplicate domain logic.
- It reuses the same ExecutionService used by REST.

Principal-level point being demonstrated
- Protocol-flexible architecture with one source of business truth.

Fallback if live step fails
- Show backend/app/mcp/server.py and explain the service call path inside app context.

## 6:30 to 7:15 - Show Tests and Git History

What to click or run
- Run backend tests: .venv/bin/python -m pytest -v
- Run git log --oneline -8

What to say
- The slice was delivered with focused commits: cache housekeeping, execution feature, MCP feature.
- Deterministic behavior is protected by automated tests.

Principal-level point being demonstrated
- Engineering discipline: testability, reviewability, and traceable change history.

Fallback if live step fails
- Show latest captured test output and commit list from terminal history.

## 7:15 to 8:00 - Trade-Offs and Production Roadmap

What to click or run
- Open README sections Key Trade-Offs and Production Roadmap.

What to say
- Current choices optimize for interview clarity and deterministic correctness.
- Production path includes persistent storage, auth, async workers, observability, provider adapters, and CI/CD.

Principal-level point being demonstrated
- Deliberate architectural trade-offs with a credible evolution plan.

Fallback if live step fails
- Summarize from memory using the six trade-off rows and roadmap bullets.
