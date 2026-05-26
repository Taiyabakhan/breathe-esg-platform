#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate

echo "Seeding default Tenant..."
python manage.py shell -c "from ingestion.models import Tenant; Tenant.objects.get_or_create(name='Acme Corp')"

echo "Starting Gunicorn server..."
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2
