# Tradeoffs

Three things deliberately not built in this prototype:

## 1. Real OAuth/API Integrations
**Why**: Implementing an actual OAuth 2.0 flow for Concur or Navan requires registered developer accounts, callback URLs, and handling token refresh lifecycles. It would consume a disproportionate amount of the available prototype development time.
**Tradeoff**: We simulate the integration by pasting the raw JSON payload the API would return. This proves the data normalization logic works without the boilerplate of auth.

## 2. Advanced Role-Based Access Control (RBAC)
**Why**: A production app needs complex permissions (e.g., "User A can upload data, Analyst B can approve, Auditor C has read-only").
**Tradeoff**: We mocked the `changed_by` user as "analyst" and skipped authentication. The focus is on the data model and ingestion pipeline, not building another login screen.

## 3. Asynchronous Task Queues (Celery/Redis)
**Why**: Parsing a 50,000-row SAP CSV synchronously in a Django view will time out the HTTP request. Production requires background workers (e.g., Celery).
**Tradeoff**: For the prototype, the CSV parsing happens synchronously in the view. It works perfectly for files up to a few thousand rows but would need refactoring for massive datasets.

## 4. No Emissions Factor Engine

The prototype focuses on ingestion, normalization, validation, and audit workflows rather than carbon calculation itself.

Production ESG platforms typically maintain:
- emissions factor libraries
- regional electricity grids
- fuel conversion tables
- aviation distance models

Those concerns were intentionally excluded to keep the prototype focused on operational data ingestion quality.