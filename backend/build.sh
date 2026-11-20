#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files for WhiteNoise
python manage.py collectstatic --no-input

# Apply database migrations to Supabase PostgreSQL
python manage.py migrate

# Seed database with initial roles, demo accounts, and stock if not already present
python manage.py seed_data
