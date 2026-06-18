# Whispr

Anonymous complaint submission and tracking for schools and organizations. Submitters get a private 6-character token; staff manage cases through a protected admin dashboard.

**Live demo**
- Frontend: [whispritt.netlify.app](https://whispritt.netlify.app)
- API: [whispr-api-4gcm.onrender.com](https://whispr-api-4gcm.onrender.com)

## Screenshots

| Home | Brand |
|------|-------|
| ![Home page](docs/screenshots/home.png) | ![Whispr logo](docs/screenshots/logo.png) |

Replace `docs/screenshots/` with full-page captures of Submit, Track, and Admin when ready.

## Architecture

```
Browser (Netlify)
  └── Vite SPA (hash routes: home, submit, track, admin)
        └── fetch → Django REST API (Render)
                          └── PostgreSQL (Render)
```

**Request flow**

1. **Submit** — `POST /api/complaints/` (public). Description is Fernet-encrypted at rest. Returns a tracking token.
2. **Track** — `POST /api/complaint_by_token/` (public). Token is the only credential; no account required.
3. **Admin** — `POST /api/admin_login/` returns a JWT. List/update endpoints require `Authorization: Bearer <token>` and a staff user.

**Repo layout**

| Path | Role |
|------|------|
| `frontend/` | Vite + Tailwind static SPA |
| `complaint/` | Django project (`manage.py`, settings, WSGI) |
| `complaint/api/` | Models, views, URL routes |
| `requirements.txt` | Python dependencies |
| `render.yaml` | Render blueprint (API + Postgres) |
| `netlify.toml` | Netlify build config |

## Stack

- **Frontend:** Vite 8, Tailwind CSS 4, vanilla JS
- **Backend:** Django 5, Django REST Framework, SimpleJWT, django-cors-headers
- **Database:** PostgreSQL (production), SQLite (local)
- **Hosting:** Netlify (frontend), Render (API + DB)

## Local development

**Backend**

```bash
cd complaint
pip install -r ../requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Vite proxies `/api` to `http://127.0.0.1:8000`. For a custom API URL, set `VITE_API_URL` in `frontend/.env`.

## Deployment

- **Render:** root dir `complaint`, build via `build.sh`, start with gunicorn. Set `DATABASE_URL`, `SECRET_KEY`, `FERNET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.
- **Netlify:** base `frontend`, set `VITE_API_URL` to your Render API URL including `/api`.

See `.env.example` for environment variable reference.

## Security notes

- Admin list/update/delete endpoints require a valid JWT from a staff user.
- Complaint text is encrypted with Fernet before storage.
- Tracking is token-based; tokens are random 6-character codes.
