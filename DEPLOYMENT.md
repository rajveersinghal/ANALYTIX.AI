# AnalytixAI - Production Deployment Guide 🚀

This guide explains how to take the AnalytixAI repository from a local development environment to a fully live, scalable SaaS product using Vercel (Frontend), Render (Backend), and MongoDB Atlas (Database).

---

## 1. Database Setup (MongoDB Atlas)
AnalytixAI relies on MongoDB for persisting User Accounts, Projects, Sessions, and Metadata logs.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free cluster.
2. Under "Network Access", add `0.0.0.0/0` (Allow access from anywhere).
3. Under "Database Access", create a Database User and copy their password.
4. Click "Connect" -> Drivers -> Copy the `mongodb+srv://...` Connection String.

---

## 2. Backend Deployment (Render.com)

Render allows you to deploy the FastAPI backend purely from a GitHub repository using our pre-built infrastructure blueprint.

1. Create a free account on [Render](https://render.com).
2. Go to your Dashboard and click **New -> Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect the `render.yaml` file in the repository root and provision a Web Service for `analytix-api`.
5. During setup or in the exact Web Service **Environment** tab, ensure you insert the required variables:
   - `MONGODB_URL`: Your exact MongoDB string from Step 1.
   - `FRONTEND_URL`: Put a placeholder for now (or put your final Vercel URL later to avoid CORS issues).
6. Click deploy. Render will install all dependencies from `requirements.txt` and launch the ASGI server (`uvicorn app.main:app`).

When it completes, copy your live backend URL (e.g., `https://analytix-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

Vercel provides native Vite and React support. Our `frontend/vercel.json` ensures that deep-linking and SPA routing are properly managed globally.

1. Create a free account on [Vercel](https://vercel.com/signup).
2. Click **Add New -> Project** and connect your GitHub root repository.
3. Once imported, click "Edit" next to the **Root Directory** setting and select `frontend/`. 
   - *This ensures Vercel only scopes building to the React files.*
4. Expand the **Environment Variables** tab and add the connection link to your newly deployed backend:
   - **Key**: `VITE_API_URL`
   - **Value**: Your Render URL (e.g., `https://analytix-api.onrender.com`)
5. Click **Deploy**. Vercel will run `npm install` and `npm run build`, pushing your SaaS live!

### Remember to Fix CORS!
Now that Vercel gave you a live frontend link (e.g., `https://analytix-ai.vercel.app`), go back to your Backend on **Render**. Update the `FRONTEND_URL` environment variable specifically to this URL so the backend permits API calls!

---

## Production Security Best Practices (Before Going Public)
- Ensure your `JWT_SECRET_KEY` in Render is genuinely cryptographically secure and rotated safely.
- Never commit your local `.env` containing your MongoDB strings to GitHub. We've ensured `.env` is inside `.gitignore`, but maintain vigilance!
- Restrict MongoDB Atlas "Network Access" to the specific static outgoing IP of your Render service once you upgrade to a paid Render tier.
