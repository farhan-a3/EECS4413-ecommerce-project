# EECS4413-ecommerce-project

Full-stack e-commerce site for **EECS 4413 – Building E-Commerce Systems**.

## Project structure

- `backend/` – Node.js + Express REST API using **Prisma** (SQLite via `dev.db`)
- `frontend/` – React (Vite) single-page app that communicates with the backend API

## Requirements
- Node.js 22.x (uses npm lockfileVersion: 3, so use a recent npm)

---

## 1. Clone the repository

```bash
git clone https://github.com/farhan-a3/EECS4413-ecommerce-project.git
cd EECS4413-ecommerce-project
```

## 2. Set up and run the backend

From the project root run:
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder with the following content:
```env
DATABASE_URL="file:./dev.db"
```
Then generate the Prisma client and start the backend server:
```bash
npx prisma generate
npm run dev   # keep this running
```

## 3. Set up and run the frontend

Open a new terminal, then from the project root run:
```bash
cd frontend
npm install
npm run dev
```

## Local URLs

- Frontend: http://localhost:3000  
- Backend API: http://localhost:5000  
- Health check: http://localhost:5000/api/health  
- Admin panel: http://localhost:3000/admin  

## 4. Docker instructions

Make sure Docker is installed and running on your machine, then from the project root run:
``` bash
docker compose up --build
```
If this doesn't work, create a `.env` file inside the `backend` folder with the following content (same as in step 2) and try again:
```env
DATABASE_URL="file:./dev.db"
```
After containers are running, use the same URLs listed in the **Local URLs** section above.

## Admin credentials

Use the following credentials to log into the admin control panel:
- Email: admin@shop.com
- Password: password123
