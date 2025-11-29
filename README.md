## Deployment

The client and server are intended to be deployed separately:

- Frontend (Vite/React) → Vercel static hosting. See `client/vercel.json` for build settings.
- Backend (Express/Socket.IO) → Render (or any Node-friendly host). A sample `server/render.yaml` plus detailed steps live in `docs/deployment.md`.

Follow the guide in `docs/deployment.md` for environment variables and provider-specific instructions.
