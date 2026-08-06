# Folder Structure Explanation

Below is an overview of the directory layout and key files:

```
face-login-app/
├── ai-service/                # Python FastAPI Microservice
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI main router, routes, schemas
│   │   └── model.py           # FaceNet (MTCNN + ResNet) wrappers
│   └── requirements.txt       # Python package dependencies
│
├── backend/                   # Express TypeScript Server
│   ├── prisma/
│   │   └── schema.prisma      # Prisma database schemas for MySQL
│   ├── src/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts # Login, Register, Profile handlers
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts # JWT verification handler
│   │   ├── routes/
│   │   │   └── auth.routes.ts     # Express router endpoints
│   │   ├── utils/
│   │   │   ├── ai.ts          # Axios wrapper calling FastAPI AI
│   │   │   └── db.ts          # Prisma DB Client instance
│   │   └── index.ts           # Bootstraps Express server configurations
│   ├── tsconfig.json          # TS compile options
│   └── package.json           # Node backend scripts & dependencies
│
├── frontend/                  # React Vite TS App
│   ├── public/                # Static assets (favicons, etc.)
│   ├── src/
│   │   ├── assets/
│   │   ├── components/        # Reusable UI widgets
│   │   │   ├── Camera.tsx         # Webcam video frame grabber
│   │   │   ├── LoadingSpinner.tsx # Clean loading spinner
│   │   │   ├── Navbar.tsx         # Header navigation links
│   │   │   ├── ProtectedRoute.tsx # Route redirect guard
│   │   │   ├── ThemeToggle.tsx    # Sun/Moon light-dark toggle button
│   │   │   └── Toast.tsx          # Status alerts / popups
│   │   ├── hooks/
│   │   │   └── useTheme.ts        # Theme toggler & localStorage hook
│   │   ├── pages/             # View routers
│   │   │   ├── Dashboard.tsx      # Authenticated user dashboard
│   │   │   ├── Landing.tsx        # Homepage hero screen
│   │   │   ├── Login.tsx          # Face scan credentials login
│   │   │   ├── NotFound.tsx       # 404 error fallback screen
│   │   │   └── Register.tsx       # Form input & multi-scan capturer
│   │   ├── utils/
│   │   │   └── api.ts             # Axios client instance with JWT headers
│   │   ├── App.tsx            # Main app router orchestration
│   │   ├── index.css          # Design system & CSS theming variables
│   │   └── main.tsx           # Mounts DOM to React Virtual DOM
│   ├── tsconfig.json          # TS config
│   └── package.json           # Frontend packages & scripts
│
├── docs/                      # General project documentation
│   ├── api_documentation.md
│   ├── environment_variables.md
│   ├── folder_explanation.md
│   ├── installation_guide.md
│   ├── project_architecture.md
│   └── sequence_diagram.md
│
└── README.md                  # Main entry repository documentation
```
