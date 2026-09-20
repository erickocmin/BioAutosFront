# SISGETRAN Frontend

Interfaz empresarial React + Vite + TypeScript. Requiere Node.js 22+ y npm 10+.

## Instalación

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Configure `VITE_API_URL=http://localhost:8000/api/v1`. El backend debe estar activo y permitir el origen `http://localhost:5173`.

## Calidad

```powershell
npm run lint
npm run test
npm run build
```

Los listados solicitan búsqueda y paginación al servidor; marcaciones y asistencia aceptan filtros de fecha, empleado, dispositivo, método y sucursal desde la API. TanStack Query gestiona caché e invalidaciones, sin reemplazar la validación autoritativa de Django.

## E2E

Playwright inicia Vite; el backend debe estar activo en `http://127.0.0.1:8000`. El caso autenticado solo utiliza credenciales ficticias proporcionadas por variables de entorno:

```powershell
npx playwright install chromium
$env:E2E_USER='usuario-demo'
$env:E2E_PASSWORD='<clave-demo>'
npm run test:e2e
```

Sin esas variables se ejecuta la validación visual pública y se omiten de forma explícita los casos autenticados.
