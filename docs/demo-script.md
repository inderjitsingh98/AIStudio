# CapabilityForge AI Walkthrough

From natural-language intent to governed, executable AI capabilities.

## Purpose

This walkthrough explains the current vertical slice in CapabilityForge AI and how the same capability can be invoked from both web and AI-client interfaces.

## Prototype Focus

The first capability is Data Quality Rules:

1. Natural-language requirements are submitted with dataset columns.
2. The provider returns structured candidate rules.
3. A human approves or rejects each candidate.
4. Only approved rules are executed.
5. A deterministic scorecard reports quality outcomes.

## Public Positioning Notes

- CapabilityForge AI is a personal engineering prototype.
- The provider is intentionally deterministic and mocked.
- The purpose is to validate architecture, contracts, approval workflow, deterministic execution, and MCP integration.
- The prototype does not claim autonomous execution or production readiness.

## Flow Summary

```mermaid
flowchart LR
    Intent[Natural-language requirements] --> CandidateRules[Structured candidate rules]
    CandidateRules --> HumanGate[Human approval or rejection]
    HumanGate --> DeterministicRun[Deterministic execution of approved rules]
    DeterministicRun --> Scorecard[Traceable quality scorecard]
```

## Interface Paths

1. REST path
- Web UI calls Next.js route handlers.
- Route handlers proxy requests to Flask API endpoints.
- Flask adapters call `ExecutionService`.

2. MCP path
- MCP clients call `generate_data_quality_rules`.
- FastMCP adapter enters app context and calls the same `ExecutionService`.

## Core Principle

AI interprets intent where ambiguity exists. Deterministic software governs execution where correctness matters.

## What To Demonstrate

1. Enter columns and natural-language requirements.
2. Review generated candidate rules.
3. Approve a subset and reject others.
4. Execute approved rules against sample records.
5. Review scorecard outputs and failed-record details.
6. Show that REST and MCP both delegate to the same service layer.
