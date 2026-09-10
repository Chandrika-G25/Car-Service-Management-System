#!/usr/bin/env bash
# Render build script for Django backend
set -o errexit

echo "==> Upgrading pip..."
pip install --upgrade pip

echo "==> Installing backend dependencies..."
pip install -r requirements.txt

echo "==> Applying database migrations..."
python manage.py migrate --no-input

echo "==> Collecting static files with WhiteNoise..."
python manage.py collectstatic --no-input

echo "==> Seeding initial demo data and default accounts..."
python manage.py seed_data

echo "==> Backend build completed successfully!"
