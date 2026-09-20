# Arquitectura frontend

React 19 + Vite + TypeScript. La aplicación se organiza por dominio, usa React Router para navegación, TanStack Query para estado de servidor y un cliente Axios con renovación controlada de JWT. No usa Redux porque no existe estado global complejo que lo justifique.

Las rutas privadas viven dentro de `ProtectedRoute` y `AppLayout`. Los módulos bloqueados (`ticketing`, `fleet`, `cargo`, `billing`) no tienen rutas ni pantallas.
