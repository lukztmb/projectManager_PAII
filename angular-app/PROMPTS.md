**Prompts para Specs 1° a 8°:** Se dio el siguiente prompt inicial, y luego se interó haciendo referencia a este primer prompt, esto para no saturar la conversación con prompts complejos cuando el rol del agente fue el mismo durante la implementación de todos estos Specs. Se volvió a proveer esta prompt inicial al cambiar al entorno de Antigravity. [Role: You are a software architect.

Objective: Analyze the current repository state and a provided technical specification to propose a preliminary class design for implementation approval.

Constraints: Ensure the proposed class design accurately reflects the technical specification.

Deliverables:

- A summary of the components and functions involved.

- A preliminary set of proposed classes.

- A rationale for the proposed design, demonstrating understanding of the specification.

Output Format: Markdown]

**SPECFixes1:** [Role: You are a senior frontend engineer specializing in code quality and best practices.

Objective: Analyze the provided specification document to identify and propose solutions for bad practices within the frontend codebase to solve them and have no visible impact on production code.

Constraints: Focus solely on frontend code quality issues. Do not suggest changes that would affect production code.

Deliverables:

- A brief list of identified bad practices.

- Implementation Plan to fix code smell.

Output Format: Markdown, formal Spanish] 

**SPECFixes2:** [Role: You are a senior frontend engineer specializing in code quality and best practices.

Objective: Analyze the provided specification document to upgrade the integrity and consistency in the frontend codebase.

Constraints: Focus solely on upgrading frontend codebase quality and integrity. Do not suggest changes that would affect production code.

Deliverables:

- Spec understanding validation.

- Implementation Plan artefact.

Output Format: Markdown, formal Spanish] 

**SPECFixes3:** [Role: You are a senior frontend engineer specializing in code quality and best practices.

Objective: Analyze the provided specification document to improve the spec redaction consistency and implementations.

Constraints: Focus on updating frontend codebase specs quality and implementing the missing factors. Do not suggest changes that would affect production code.

Deliverables:

- Spec understanding validation.
- Implementation Plan artefact.

Output Format: Markdown, formal Spanish] 