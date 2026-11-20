# StockSmart: Production Deployment Guide

This guide details how to host StockSmart across its target cloud infrastructure:
1. **Database**: Supabase (PostgreSQL 15+)
2. **Backend**: Render (Python Web Service with Gunicorn & WhiteNoise)
3. **Frontend**: GitHub Pages (React Vite Static Site with GitHub Actions)

---

## 1. Supabase PostgreSQL Database Setup

1. **Sign Up / Log In**: Visit [supabase.com](https://supabase.com) and click **"New Project"**.
2. **Project Settings**:
   - Project Name: `stocksmart-db`
   - Database Password: Create a strong password (save this securely).
   - Region: Select the region closest to your deployment (e.g., *South Asia (Mumbai)* or *US East*).
3. **Retrieve Database Connection URL**:
   - Go to **Project Settings** -> **Database**.
   - Under **Connection string**, select **URI**.
   - Copy the URI string:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```
     *(Or use the Connection Pooler URI on port `6543`)*.
4. **Execute Schema & Seed Scripts**:
   - Open the **SQL Editor** tab in the Supabase Dashboard.
   - Click **"New Query"**, copy the contents of `database/schema.sql`, and click **Run**.
   - Open another query, copy the contents of `database/seed_data.sql`, and click **Run**.
   - Navigate to the **Table Editor** to verify that all 15 tables are populated with Indian-context sample records.

---

## 2. Render Backend Hosting Setup

StockSmart is pre-configured with `render.yaml` and `backend/build.sh` for one-click or manual deployment on Render.

### Option A: Manual Setup via Render Dashboard
1. Go to [render.com](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub repository (`mca2-track-stocksmart`).
3. Configure the service settings:
   - **Name**: `stocksmart-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Region**: Oregon (or Frankfurt)
   - **Branch**: `main` (or `develop`)
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn stocksmart.wsgi:application --bind 0.0.0.0:$PORT`
4. Add the following **Environment Variables**:
   | Variable Name | Value | Note |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres` | Your Supabase connection string |
   | `DJANGO_DEBUG` | `False` | Disables debug mode in production |
   | `DJANGO_SECRET_KEY` | *(Click "Generate" or provide a secure key)* | Django encryption secret |
   | `DJANGO_ALLOWED_HOSTS` | `*` | Or `your-service.onrender.com` |
   | `CORS_ALLOW_ALL` | `True` | Or your GitHub Pages URL |
   | `PYTHON_VERSION` | `3.13.0` | Target runtime |
5. Click **"Create Web Service"**.
6. When deployment finishes, test the health check:
   `https://stocksmart-backend.onrender.com/api/health/` -> should return `{"status": "ok"}`.

---

## 3. GitHub Pages Frontend Hosting Setup

StockSmart includes `.github/workflows/deploy.yml` which automatically builds and publishes the React Vite frontend whenever you push to GitHub.

1. **Configure Repository Secret**:
   - On GitHub, go to your repository **Settings** -> **Secrets and variables** -> **Actions**.
   - Click **"New repository secret"**.
   - Name: `VITE_API_BASE_URL`
   - Value: `https://stocksmart-backend.onrender.com/api` (replace with your Render backend URL).
2. **Enable GitHub Pages**:
   - Go to repository **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**, select **"GitHub Actions"**.
3. **Trigger Deployment**:
   - Push your code to the `main` or `develop` branch.
   - Go to the **Actions** tab to watch the workflow build the React app and deploy it.
4. **Access Your Live App**:
   - Your frontend will be live at:
     `https://<your-username>.github.io/<your-repo-name>/`
   - Create application accounts through the deployed backend. For local sample accounts, set a unique `STOCKSMART_SEED_PASSWORD` in `backend/.env` and run `python manage.py seed_data`. Do not use the sample seeding command or its accounts in production.
