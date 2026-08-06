# Installation & Setup Guide

Follow these steps to run the Face Recognition Login application locally.

## Prerequisites
- **Node.js** (v18 or higher)
- **Python** (3.9 or higher, preferably 3.10/3.11/3.12)
- **MySQL** Database Server running locally or in the cloud.

---

## 1. Set Up Python AI Service

Navigate into the `ai-service` directory:
```bash
cd ai-service
```

Create a Python virtual environment:
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows**:
  ```bash
  .\venv\Scripts\activate
  ```
- **macOS / Linux**:
  ```bash
  source venv/bin/activate
  ```

Install dependencies:
```bash
pip install -r requirements.txt
```
*Note: Installing PyTorch and torchvision might take a few minutes depending on your internet connection.*

Start the FastAPI service:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The service will boot up and listen on `http://localhost:8000`. You can test it by visiting `http://localhost:8000/health`.

---

## 2. Set Up Express Backend Server

Navigate into the `backend` directory:
```bash
cd ../backend
```

Install Node.js dependencies:
```bash
npm install
```

Configure your environment variables:
Copy the `.env.example` file to `.env`:
- On Windows PowerShell: `copy .env.example .env`
- On Linux/macOS: `cp .env.example .env`

Edit `.env` to configure your database url and JWT secret key:
```env
DATABASE_URL="mysql://<user>:<password>@localhost:3306/<database_name>"
JWT_SECRET="generate_a_long_random_string"
AI_SERVICE_URL="http://localhost:8000"
```

Perform Prisma database schema migrations:
Make sure your MySQL server is running and the database specified in your connection string exists (or Prisma will automatically create it if it has permissions).
```bash
npx prisma db push
```
This pushes the Prisma schema directly to MySQL without creating file-based migration histories, which is perfect for local setups.

Start the backend server in development mode:
```bash
npm run dev
```
The server will start on port `5000` (i.e. `http://localhost:5000`).

---

## 3. Set Up React Frontend Client

Navigate into the `frontend` directory:
```bash
cd ../frontend
```

Install React application dependencies:
```bash
npm install
```

Start the Vite development web server:
```bash
npm run dev
```
The Vite server will output a URL, usually `http://localhost:5173`. Open this URL in a modern browser (Chrome, Edge, Firefox, or Safari) to interact with the application.
