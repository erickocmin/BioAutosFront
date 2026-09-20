# API

`VITE_API_URL` apunta a `/api/v1`. El access token se mantiene en `sessionStorage`; el refresh token permite renovar sesión y se revoca al cerrar. Los errores del backend siguen `{code, message, errors}`. TanStack Query evita solicitudes duplicadas y mantiene caché breve de catálogos/listados.
