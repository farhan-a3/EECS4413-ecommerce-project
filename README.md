# EECS4413-ecommerce-project

Full-stack e-commerce site for **EECS 4413 – Building E-Commerce Systems**.

The codebase has two main parts:

- `backend/` – Node.js + Express API using **Prisma** and a database  
- `frontend/` – React (Vite) single-page app that talks to the backend  

---

## 1. Clone the repository

```bash
git clone https://github.com/farhan-a3/EECS4413-ecommerce-project.git
cd EECS4413-ecommerce-project
```

## 2. Set up and run the backend

From the project root:
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` folder with the following content:
```env
DATABASE_URL="file:./dev.db"
```
Then generate the Prisma client and start the backend server:
```
npx prisma generate
npm run dev   # keep this running
```

## 3. Set up and run the frontend

Open a new terminal, then from the project root:
```bash
cd frontend
npm install
npm run dev
```
