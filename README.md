# SISGETRAN Frontend

SPA en React 19 + Vite + TypeScript que consume la API del backend Django (`../sisgetran-backend`). Requiere Node 20+ (probado con Node 24) y el backend corriendo en `http://localhost:8000`.

> ¿Primera vez configurando esto, incluido el huellero biométrico por Ethernet? Sigue la guía completa en el backend: [`../sisgetran-backend/docs/puesta-en-marcha.md`](../sisgetran-backend/docs/puesta-en-marcha.md).

## Instalación

No hay `requirements.txt`: las dependencias se resuelven con `npm install` a partir de `package.json` (React, React Router, TanStack Query, Axios, Zod, React Hook Form como dependencias; Vite, TypeScript, Playwright y Vitest como herramientas de desarrollo).

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

`.env.example` ya trae `VITE_API_URL=http://localhost:8000/api/v1`, apuntando al backend local. Abre `http://localhost:5173` e inicia sesión (usuario `demo` / contraseña `DemoOnly.2026` si el backend corrió `manage.py seed_demo`).

## Scripts disponibles

```powershell
npm run dev        # servidor de desarrollo (Vite)
npm run build      # type-check (tsc -b) + build de producción
npm run lint        # oxlint sobre src/
npm run test        # pruebas unitarias (vitest)
npm run test:e2e    # pruebas end-to-end (Playwright, requiere E2E_USER/E2E_PASSWORD)
npm run preview     # sirve el build de producción localmente
```

## Pantallas de biometría local

- **Registrar empleado** (`/attendance/registro`): datos del empleado y PIN biométrico. La huella se enrola físicamente en el huellero con ese mismo PIN.
- **Reconocimiento** (`/attendance/biometric`): autoriza el huellero por Ethernet y muestra en vivo las entradas/salidas detectadas, con aviso cuando un PIN marcado todavía no tiene un empleado registrado.
