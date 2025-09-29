---
description: 
globs: 
alwaysApply: true
---
Dev Server & Application Port
=============================================

Application Port Rule:
--------------------------
- The application is **always running on `http://localhost:5173/`** during development.
- You do **not** need to run `npm run dev` every time to preview the app.

Do Not:
- Do not start a new dev server unless it's confirmed to be stopped.
- Do not assume the port is random or dynamic – it is fixed at **5173**.

Context:
- This is a Vite-based React project with a consistent dev server port.

