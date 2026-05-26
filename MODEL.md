# Data Model

The core problem of emissions data ingestion is dealing with disparate schemas, bad data, and the absolute requirement for auditability. Our data model is built to handle this reality.

## 1. Tenant (Multi-Tenancy)
Represents a client company. All data is scoped to a Tenant to ensure isolation.

## 2. DataUpload
Tracks each ingestion event (file upload or API sync).
- `source_type`: (SAP, Utility, Travel)
- `uploaded_by`: Who initiated the sync.
- `uploaded_at`: Timestamp.

## 3. NormalizedEmissionRecord
The single source of truth for normalized, reviewable data.
- **Polymorphism via raw payload:** Instead of creating a dozen different tables for every source system's schema, we store the *exact* original row/object in a JSON field. This is critical for the audit trail; auditors can always see exactly what came out of the source system.
- **Normalized Fields:** We extract only the fields necessary for carbon calculation: `quantity`, `normalized_unit`, `date_start`, `date_end`, and `scope_category`.
- **Validation Errors:** A JSON field storing any parsing or mapping errors (e.g., "Unknown plant W001"). This allows the app to ingest everything (never losing data) while highlighting problematic rows for the analyst.
- **Status & Workflow:** `PENDING`, `APPROVED`, `REJECTED`. Analysts review pending rows, fix errors, and approve them.
- **Immutability Flags:** `is_edited` flags if an analyst touched the row before approval.

## Why a Normalized Layer Exists

Each upstream system (SAP, utility portals, travel APIs) exposes data in a completely different structure, unit system, and level of quality. Building calculations directly on top of raw source schemas would tightly couple the application to vendor-specific formats.

The normalization layer isolates downstream workflows from source-system variability. Regardless of whether the input came from SAP procurement exports, utility billing CSVs, or travel APIs, analysts interact with a single consistent structure.

This also simplifies:
- validation
- approval workflows
- auditability
- future emissions factor calculations
- downstream reporting pipelines

## 4. AuditLog
Tracks every manual edit an analyst makes to a `NormalizedEmissionRecord`.
- `field_name`
- `old_value`
- `new_value`
- `changed_by`
- `changed_at`
This preserves a complete audit trail and establishes traceability back to the original source system. If an auditor asks why a 1000 kWh bill was calculated as 100 kWh, the audit log will show the analyst corrected a typo.

## Why Auditability Matters

ESG disclosures are subject to increasing regulatory scrutiny and third-party assurance. Analysts must be able to explain:
- where a number originated
- whether it was modified
- who modified it
- when it was modified

For that reason, the system stores:
- the original raw payload
- validation issues
- record status history
- manual edits through AuditLog

## Architectural Philosophy

The prototype prioritizes operational realism over feature breadth.

Instead of building a large number of disconnected CRUD entities, the system focuses on the hardest parts of ESG data onboarding:
- heterogeneous source systems
- inconsistent operational data
- validation workflows
- auditability
- analyst review processes

The architecture intentionally separates:
1. ingestion
2. normalization
3. validation
4. approval

This creates a foundation that could later support:
- emissions factor engines
- regulatory reporting
- automated anomaly detection
- supplier sustainability integrations
- enterprise ERP/API connectivity