# Environment Variables Configuration

This file provides descriptions for all the environment configuration parameters used in the application.

## 1. Backend Server Environment Config (`backend/.env`)

These environment variables configure the Express TS gateway.

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `PORT` | No | `5000` | The network port the Express application server listens on. |
| `DATABASE_URL` | Yes | `mysql://root:password@localhost:3306/face_login_db` | Connection string for the MySQL server (format: `mysql://username:password@host:port/database_name`). |
| `JWT_SECRET` | Yes | - | Secret key used to encrypt and verify JSON Web Tokens signed by the server. |
| `AI_SERVICE_URL` | Yes | `http://localhost:8000` | The HTTP endpoint address of the Python FastAPI face embedding service. |

---

## 2. Frontend Client Environment Config (`frontend/.env`)

These client-side environment variables configures Vite during compilation.

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:5000/api` | The Express backend API route url that Axios uses to send requests. |
