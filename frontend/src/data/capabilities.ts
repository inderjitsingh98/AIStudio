export type Capability = {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
};

export const capabilities: Capability[] = [
  {
    id: "data-quality-rules",
    type: "Skill",
    category: "Data Governance",
    name: "Data Quality Rules",
    description:
      "Generate, validate, and execute reusable data quality rules.",
  },
  {
    id: "data-quality-scorecard",
    type: "App",
    category: "Observability",
    name: "Data Quality Scorecard",
    description:
      "Measure completeness, validity, consistency, and uniqueness.",
  },
  {
    id: "data-lineage-explorer",
    type: "Agent",
    category: "Discovery",
    name: "Data Lineage Explorer",
    description:
      "Understand how enterprise data moves between systems.",
  },
  {
    id: "policy-exception-advisor",
    type: "Agent",
    category: "Compliance",
    name: "Policy Exception Advisor",
    description:
      "Review policy exceptions and recommend compliant remediation paths.",
  },
];