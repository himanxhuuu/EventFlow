# IntelliJ IDEA Setup Guide

## Main Entry Points

### Backend Server (Node.js/Express)
**Main File:** `server/index.js`
- This is the Express server that runs on port 5000
- Contains all API routes and database initialization

### Frontend (React/Vite)
**Entry Point:** `client/src/main.jsx`
- React application entry point
- However, it's run via Vite dev server, not directly

## Setting Up Run Configurations in IntelliJ

### Option 1: Run Backend Server Only

1. **Create a Node.js Run Configuration:**
   - Go to `Run` → `Edit Configurations...`
   - Click `+` → Select `Node.js`
   - **Name:** `Backend Server`
   - **Node interpreter:** Select your Node.js installation
   - **Working directory:** `$ProjectFileDir$/server`
   - **JavaScript file:** `index.js`
   - **Application parameters:** (leave empty)
   - **Environment variables:** (optional, or use `.env` file)
   - Click `OK`

2. **Run the configuration:**
   - Select `Backend Server` from the run dropdown
   - Click the green play button

### Option 2: Run Both Backend and Frontend

You'll need two separate run configurations:

**Configuration 1: Backend Server**
- **Name:** `Backend Server`
- **Working directory:** `server`
- **JavaScript file:** `index.js`
- **Node interpreter:** Your Node.js installation

**Configuration 2: Frontend Dev Server**
- **Name:** `Frontend Dev Server`
- **Working directory:** `client`
- **Node interpreter:** Your Node.js installation
- **JavaScript file:** (leave empty)
- **Application parameters:** `run dev`
- **Or use npm script:** 
  - Go to `package.json` in `client` folder
  - Right-click on `"dev"` script → `Run 'dev'`

### Option 3: Use npm Scripts (Easiest)

1. **Open Terminal in IntelliJ:**
   - `Alt + F12` or `View` → `Tool Windows` → `Terminal`

2. **Run from root directory:**
   ```bash
   npm run dev
   ```
   This runs both backend and frontend together.

## Recommended Setup

### For Development:
Use **Option 3** (npm scripts) - it's the simplest and runs both servers.

### For Debugging Backend:
Use **Option 1** - Create a Node.js run configuration for `server/index.js`

## Environment Variables

Make sure you have a `.env` file in the `server` directory:
```env
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## Project Structure

```
design thinking/
├── server/
│   ├── index.js          ← Backend entry point
│   ├── routes/
│   ├── database/
│   └── services/
├── client/
│   ├── src/
│   │   └── main.jsx      ← Frontend entry point
│   └── vite.config.js
└── package.json          ← Root package.json
```

## Quick Start in IntelliJ

1. Open the project in IntelliJ
2. Open Terminal (`Alt + F12`)
3. Run: `npm run dev`
4. Backend will start on `http://localhost:5000`
5. Frontend will start on `http://localhost:3000`

## Debugging

To debug the backend:
1. Set breakpoints in `server/index.js` or any route file
2. Create a Node.js run configuration for `server/index.js`
3. Run in debug mode (bug icon)
4. Your breakpoints will be hit when API requests are made

