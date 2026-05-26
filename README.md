# 🍃 Breathe ESG: Emissions Data Ingestion Pipeline

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render)

A full-stack prototype application built for the **Breathe ESG Tech Intern Assignment**. This application serves as a robust data ingestion pipeline capable of accepting raw, disparate emissions data from various enterprise sources, normalizing it, and providing a clean audit trail.

---

## 🚀 Live Demo
The application is fully deployed and accessible here:
**[https://breathe-esg-ingestion.onrender.com/](https://breathe-esg-ingestion.onrender.com/)**

---

## 🏗 Architecture & Documentation
As requested in the assignment rubric, the technical decision-making and architectural designs have been thoroughly documented in the following files:

- 🗄️ **[MODEL.md](./MODEL.md)**: Details the database schema, multi-tenancy, Scope categorization, and how the `raw_payload` drives absolute auditability.
- 🤔 **[DECISIONS.md](./DECISIONS.md)**: Outlines ambiguities encountered, parsing decisions for SAP/Utility/Concur data, and questions for the Product Manager.
- ⚖️ **[TRADEOFFS.md](./TRADEOFFS.md)**: Explains what was deliberately scoped out of this 4-day prototype (e.g., real OAuth, Celery workers) and why.
- 🔍 **[SOURCES.md](./SOURCES.md)**: Discusses the real-world formatting of the three targeted data sources and provides sample CSV/JSON structures.

---

## 💻 Tech Stack
* **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Backend:** Python, Django, Django REST Framework
* **Database:** SQLite (Prototype)
* **Deployment:** Docker, Render

---

## 🛠️ Local Development Setup

To run this project locally, you can use the provided `Dockerfile` or run the frontend and backend manually.

### Option 1: Docker (Recommended)
1. Ensure Docker is installed and running.
2. Build the image:
   ```bash
   docker build -t breathe-esg .
   ```
3. Run the container:
   ```bash
   docker run -p 8000:8000 breathe-esg
   ```
4. Access the application at `http://localhost:8000`.

### Option 2: Manual Setup

**Backend (Django):**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend (React/Vite):**
```bash
cd frontend
npm install
npm run dev
```

---

## ✨ Key Features
* **Multi-Source Ingestion:** Seamlessly handles SAP Procurement CSVs, Utility Electricity bills, and Concur Travel API JSON payloads.
* **Audit Trail Security:** Retains the exact original data row as a `raw_payload` JSON alongside the normalized metrics. Tracks every manual analyst edit.
* **Resilient Parsing:** Never drops data. Invalid values or unmapped plants are flagged in a `validation_errors` JSON column, allowing analysts to fix them manually in the UI rather than failing the upload.
