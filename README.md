## My Real Estate App (Frontend + Backend)

### Quick start
- **Install**:
  - `npm install`
  - `npm install --prefix backend`
- **Run both** (recommended):
  - `npm run dev:all`

### Local URLs
- **Frontend (Vite)**: `http://localhost:5173`
- **Backend (Express)**: `http://localhost:5174`

### Backend API
All endpoints are under `/api`.

- **GET** `/api/health`
- **GET** `/api/builders`
- **GET** `/api/builders/:id`
- **GET** `/api/properties`
  - Optional query params: `search`, `builderId`, `type`, `status`, `sortBy`, `limit`, `offset`
- **GET** `/api/properties/:id`
- **POST** `/api/inquiries`
  - Body example:

```json
{
  "name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane@example.com",
  "interest": "Buying a Property",
  "budget": "₹50L – ₹1 Crore",
  "city": "OMR Chennai",
  "message": "Looking for a 3BHK near SIPCOT"
}
```

### Notes
- **Data source**: the backend seeds property data from `src/data/properties.js`.
- **Inquiry storage**: submissions are appended to `backend/data/inquiries.json`.
- **Proxy**: Vite proxies `/api` to the backend (see `vite.config.js`).

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
