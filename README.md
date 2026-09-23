# Panel de Ventas Unaluka

Sistema web para consultar la información de ventas y pedidos que hoy el equipo Comercial maneja en dos archivos de Excel.

## Qué se desarrolló

- Login con Google y dos roles: Administrador y Solo lectura.
- Dashboard con ventas totales, evolución de ventas mes a mes, productos/SKU más vendidos y ventas por vendedor.
- Buscador de pedidos con filtros por vendedor, estado y texto libre (pedido, cliente, producto o SKU), con paginación.
- Pantalla de administración de usuarios (solo Administrador) para cambiar el rol de cualquier persona que haya iniciado sesión alguna vez.
- Script de carga (`npm run seed`) que procesa ambos Excel y los deja en una base SQLite local.

## Cómo se usaron y relacionaron los dos archivos

- **`detalle_pedidos_2026.xlsx`** (hoja "Detalle") es la fuente principal para todo el dashboard y el buscador de pedidos: trae el detalle completo de cada pedido (vendedor, SKU, categoría, canal, estado, montos). Las métricas de ventas solo consideran pedidos con estado "Completada".
- **`control_ventas_2026.xlsx`** es el registro manual diario que usa hoy el equipo Comercial. Se carga en una tabla aparte (`control_ventas`) como referencia, pero no se cruza fila por fila contra `detalle_pedidos`: los códigos de pedido no siempre coinciden en formato entre ambos archivos (a veces falta el prefijo "UP", y hay vendedores que aparecen en un archivo y no en el otro), así que reconciliarlos con certeza no era viable en el tiempo disponible. Queda pendiente si en algún momento se necesita ese cruce exacto.

## Qué quedó pendiente

- No hay una pantalla para invitar usuarios manualmente: cualquiera que inicia sesión con Google queda registrado automáticamente con rol "Solo lectura" (salvo los correos definidos en `ADMIN_EMAILS`, que entran como Administrador desde el primer login). Desde ahí, un Administrador puede subir de rol a otras personas en la pantalla de Usuarios.
- El cruce fila por fila entre `control_ventas` y `detalle_pedidos` (mencionado arriba) no se implementó.
- No hay pruebas automatizadas, por el tiempo disponible.
- La búsqueda de pedidos es exacta (sin fuzzy search) y la paginación es simple, sin salto a una página arbitraria.

## Cómo correrlo localmente

Requiere Node.js 20 o superior.

1. Instalar dependencias:
   ```
   npm install
   ```
2. Cargar los datos desde los Excel (ya están incluidos en `data/source/`):
   ```
   npm run seed
   ```
   Esto genera `data/app.db` (SQLite), que no se versiona en git.
3. Copiar `.env.example` a `.env.local` y completar:
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`: crear un OAuth Client ID tipo "Web application" en Google Cloud Console, con `http://localhost:3000/api/auth/callback/google` como URI de redirección autorizada.
   - `AUTH_SECRET`: un string aleatorio (se puede generar con `npx auth secret`).
   - `ADMIN_EMAILS`: correo(s) que deben quedar como Administrador desde el primer login, separados por coma.
4. Levantar el servidor:
   ```
   npm run dev
   ```
   y abrir http://localhost:3000.

## Sobre el horario de inicio

Por un imprevisto, el desarrollo empezó más tarde del horario en que llegó el correo original, con autorización previa para hacerlo. El punto de partida real queda reflejado en la fecha de creación de este repositorio y en el historial de commits, hechos de forma incremental a medida que avanzaba cada parte.
