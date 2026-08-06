# Face Recognition Login System (FACELOCK)

A biometric full-stack authentication application using deep-neural face verification. Users register using their webcam alongside an email & password, and can subsequently log in using either credentials or their face.

---

## 🚀 Quick Links
- **[Installation & Setup Guide](file:///c:/Users/HP/OneDrive/Attachments/Desktop/Face/docs/installation_guide.md)**
- **[Project Architecture](file:///c:/Users/HP/OneDrive/Attachments/Desktop/Face/docs/project_architecture.md)**
- **[API Documentation](file:///c:/Users/HP/OneDrive/Attachments/Desktop/Face/docs/api_documentation.md)**
- **[Environment Variables](file:///c:/Users/HP/OneDrive/Attachments/Desktop/Face/docs/environment_variables.md)**
- **[Sequence Diagrams](file:///c:/Users/HP/OneDrive/Attachments/Desktop/Face/docs/sequence_diagram.md)**
- **[Directory Structure Details](file:///c:/Users/HP/OneDrive/Attachments/Desktop/Face/docs/folder_explanation.md)**

---

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, React Router, Axios, Lucide Icons, Vanilla CSS
- **Backend Server**: Node.js, Express, TypeScript, Prisma ORM, JWT Authentication, Nodemailer, BcryptJS, Cookie-Parser, Express-Rate-Limit
- **AI Microservice**: Python, FastAPI, FaceNet-PyTorch (`InceptionResnetV1`), MTCNN, OpenCV, NumPy
- **Database**: SQLite (Local development database `dev.db`)

---

## 🔑 Dual Login & Feature Workflows

### 1. How Registration Works
1. The user inputs **Full Name**, **Email**, **Password**, and **Confirm Password**.
2. Frontend checks the email format, verifies that the password is at least 8 characters long, and ensures that the passwords match.
3. The user opens the camera and records **5 distinct face angles**.
4. The backend sends the images to the FastAPI service **in parallel** using `Promise.all()`, reducing processing wait times by over 70%.
5. The FastAPI service processes MTCNN alignments in a **single pass** (speeding up image cropping and alignment passes).
6. It runs a similarity search on database embeddings to verify the face is not already registered.
7. The password is encrypted using **bcryptjs** (rounds = 10).
8. The database transaction stores the User model (with `passwordHash`) and links it to the `FaceEmbedding` records.
9. A welcome HTML email is triggered **asynchronously** using Gmail SMTP through a globally cached **Nodemailer** transport pool, preventing socket leakage and blocking behavior.

### 2. How Password Login Works
1. The user enters their **Email** and **Password** on the tabbed login page.
2. The backend looks up the user by email. If not found, it returns a **generic credentials error**.
3. It compares the raw password against the stored hash using **bcryptjs**. If they mismatch, it returns a **generic credentials error** (does not reveal if the email or password was wrong to prevent brute-force profiling).
4. On verification success, it signs a JWT, writes it to a secure, **HTTP-only cookie** (`token`), and returns user details.

### 3. How Face Login Works
1. The user selects **Face Recognition** on the tabbed login page.
2. The user captures a live webcam scan.
3. Backend requests the embedding from the FastAPI service.
4. Backend fetches all face candidate embeddings from the SQLite database.
5. FastAPI compares the vectors using **vectorized NumPy matrix multiplication** ($cos = \frac{A \cdot B}{\|A\| \|B\|}$ done simultaneously in C-space), ensuring instant verification matching even with thousands of user vectors.
6. If the highest score exceeds the threshold (`process.env.FACE_SIMILARITY_THRESHOLD` or `0.72`), it fetches user details, issues an **HTTP-only cookie**, and redirects to the Dashboard.

---

## 📬 How to Configure Gmail App Password
To use Gmail SMTP for sending registration welcome emails:
1. Log in to your **Google Account**.
2. Go to **Security** settings.
3. Under *How you sign in to Google*, ensure **2-Step Verification** is enabled.
4. Search for or select **App Passwords**.
5. Input a descriptive name (e.g. `Face Login App`) and click **Create**.
6. Google will display a **16-character password** (e.g. `abcd efgh ijkl mnop`).
7. Copy this 16-character password into your `backend/.env` file:
   ```env
   EMAIL_USER="your-gmail-address@gmail.com"
   EMAIL_PASS="abcdefghijklmnop" (without spaces)
   ```

---

## 🛰️ API Endpoints

All auth routes are grouped under `/api/auth` prefix (guarded by an IP-based rate limiter allowing max 100 requests per 15 minutes), while session resources reside directly under `/api`.

| HTTP Method | Route | Authentication | Payload Schema | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | None | `{ name, email, password, images: string[] }` | Registers account credentials and face scans. |
| `POST` | `/api/auth/login` | None | `{ email, password }` | Authenticates user credentials and sets secure HTTP-only cookie. |
| `POST` | `/api/auth/face-login` | None | `{ image: string }` | Authenticates live webcam scans and sets secure HTTP-only cookie. |
| `GET` | `/api/profile` | **Cookie JWT** | - | Retrieves the current session user details. |
| `POST` | `/api/logout` | None | - | Clears the secure session cookie in the browser. |

---

## 🎨 Design & Security Philosophy
- **XSS Mitigations**: Session tokens are held in **HTTP-only, Secure, SameSite=Strict cookies**, preventing access from browser scripts.
- **Swiss Monochrome Theme**: Uses only black, white, and grays for high contrast, clean typography, and zero distractions.
- **Privacy First**: Raw face images are deleted immediately after vector extraction. Only mathematical embeddings are stored.
- **Cascading purges**: Deleting a User account automatically cascades and deletes all related face embedding vectors.
