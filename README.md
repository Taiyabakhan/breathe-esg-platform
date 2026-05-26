# Breathe ESG Platform

A production-style ESG (Environmental, Social, Governance) data ingestion and audit platform built with Django, Django REST Framework, React, and Tailwind CSS.

The system ingests sustainability-related operational data from multiple enterprise systems, normalizes records into a consistent schema, validates suspicious entries, and supports analyst review workflows with auditability.

---

# Features

## ESG Data Ingestion

Supports ingestion from:

* SAP procurement/fuel exports
* Utility electricity billing exports
* Corporate travel systems (Concur-style payloads)

---

## Validation & Review Workflow

The platform detects:

* invalid dates
* unsupported units
* suspicious quantities
* malformed records
* incomplete travel data

Records are routed into a review workflow where analysts can:

* inspect validation issues
* approve records
* reject records
* maintain audit history

---

## Multi-Tenant Architecture

Each organization operates in an isolated tenant context.

Supported through:

* tenant-based record ownership
* isolated uploads
* tenant-scoped ESG records

---

## Auditability

Every normalized record maintains:

* original raw payload
* validation metadata
* review status
* analyst edits
* audit log tracking

This mirrors real-world ESG assurance and compliance workflows.

---

# Tech Stack

## Backend

* Django
* Django REST Framework
* PostgreSQL (production)
* SQLite (local development)
* pandas

## Frontend

* React
* TypeScript
* Tailwind CSS
* Axios
* Vite

## Deployment

* Backend → Render
* Frontend → Vercel

---

# Project Structure

```bash
breathe-esg-platform/
│
├── backend/
│   ├── config/
│   ├── ingestion/
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── sample_data/
├── Screenshots/
├── README.md
├── MODEL.md
├── DECISIONS.md
├── TRADEOFFS.md
├── SOURCES.md
└── render.yaml
```

---

# ESG Workflow Overview

## 1. Upload Operational Data

Users upload:

* SAP CSV exports
* Utility billing CSVs
* Travel JSON payloads

---

## 2. Normalize Data

The backend transforms heterogeneous source data into a standardized emissions activity structure.

Examples:

* SAP fuel → Scope 3 activity
* Utility electricity → Scope 2 activity
* Travel mileage → Scope 3 travel activity

---

## 3. Validation

The ingestion layer validates:

* dates
* units
* quantities
* required fields

Invalid records are flagged instead of rejected outright.

---

## 4. Analyst Review

Analysts review:

* pending records
* validation warnings
* suspicious activity

Records may be:

* APPROVED
* REJECTED
* FLAGGED

---

## 5. Audit Trail

All changes are tracked through AuditLog entries for traceability and compliance review.

---

# Local Development Setup

# 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/breathe-esg-platform.git
cd breathe-esg-platform
```

---

# 2. Backend Setup

## Create Virtual Environment

```bash
cd backend

python -m venv .venv
```

Activate virtual environment:

### Windows

```bash
.venv\Scripts\activate
```

### Mac/Linux

```bash
source .venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Run Migrations

```bash
python manage.py migrate
```

---

## Create Superuser

```bash
python manage.py createsuperuser
```

---

## Start Backend Server

```bash
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000
```

---

# 3. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# Django Admin

Admin panel available at:

```text
http://127.0.0.1:8000/admin
```

Use the superuser credentials created earlier.

The admin panel allows:

* tenant management
* upload inspection
* audit review
* normalized record inspection

---

# Sample Data

Sample datasets are available in:

```text
sample_data/
```

Included:

* sap_procurement.csv
* utility_electricity.csv
* travel_data.csv

These intentionally include:

* malformed dates
* suspicious quantities
* inconsistent units
* incomplete records

to exercise validation workflows realistically.

---

# Deployment

# Backend Deployment (Render)

## Create Render Web Service

Connect GitHub repository:

* Root Directory → `backend`
* Build Command:

```bash
pip install -r requirements.txt
```

* Start Command:

```bash
gunicorn config.wsgi
```

---

## Environment Variables

Add:

```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-render-domain.onrender.com
DATABASE_URL=your-postgres-url
```

---

# Frontend Deployment (Vercel)

Import GitHub repository into Vercel.

## Root Directory

```text
frontend
```

## Build Command

```bash
npm run build
```

## Output Directory

```text
dist
```

---

# Update API Base URL

Update frontend API config:

```ts
const API_BASE = "https://your-render-backend-url.onrender.com/api";
```

---

# Production Considerations

This prototype intentionally excludes:

* OAuth integrations
* asynchronous task queues
* emissions factor engines
* advanced RBAC
* configurable schema mapping

The focus is operational ESG ingestion workflows:

* ingestion
* normalization
* validation
* analyst review
* auditability

---

# Future Improvements

Potential future enhancements:

* Celery background workers
* airport geolocation lookups
* emissions factor libraries
* configurable ingestion templates
* automated anomaly detection
* SSO/OAuth integration
* tenant-level permissions

---

# Screenshots

Screenshots available in:

```text
Screenshots/
```

---

# Documentation

Additional project documentation:

* MODEL.md
* DECISIONS.md
* TRADEOFFS.md
* SOURCES.md

---

# License

This project was built as part of a technical internship assignment focused on ESG operational data ingestion workflows.
