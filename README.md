# RutinasApp

Herramienta para cargar rutinas de gimnasio a tus alumnos, seguir su progreso
(peso corporal y entrenamientos completados) y compartírselas online mediante
un link personal por alumno, con opción de exportar a PDF.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma 7 (con driver adapters) — SQLite en desarrollo, PostgreSQL (Neon) en producción
- Autenticación simple por passcode para `/admin` (pensado para un solo entrenador)

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). La primera vez te va a pedir
la contraseña de `/admin` (variable `ADMIN_PASSCODE` en `.env.local`).

Variables de entorno (ver `.env.example`):

- `DATABASE_URL` — en local queda `file:./dev.db` (SQLite, no requiere nada más).
- `ADMIN_PASSCODE` — la contraseña para entrar a `/admin`. Cambiala cuando quieras.
- `SESSION_SECRET` — clave para firmar la cookie de sesión. Generar con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### Base de datos

El schema vive en `prisma/schema.prisma`. Después de modificarlo:

```bash
npm run db:migrate
```

Para explorar los datos con una UI:

```bash
npm run db:studio
```

## Cómo funciona

- **`/admin`** (protegido por passcode): alta de alumnos, carga y edición de
  rutinas (por días y ejercicios), registro de peso corporal, e historial de
  entrenamientos completados.
- **`/r/[token]`** (público, sin login): cada alumno tiene un link único desde
  el botón "Copiar link del alumno" en su ficha. Ahí ve su rutina activa,
  puede marcar el día como completado y registrar su peso.
- **Exportar a PDF**: el botón "Descargar PDF" (en admin y en la vista del
  alumno) usa la impresión del navegador (`window.print()`) con estilos que
  ocultan botones y formularios, dejando solo la rutina.
- Cada vez que guardás una rutina nueva para un alumno, la anterior queda en
  el historial (no se borra) y la nueva pasa a ser la activa.

## Deploy a producción (Vercel + Neon)

La app está pensada para desarrollarse en local con SQLite y desplegarse con
PostgreSQL. Pasos:

1. **Crear una base en Neon** ([neon.tech](https://neon.tech), tiene plan
   gratuito). Copiá la connection string (`postgresql://...`).
2. **Cambiar el datasource** en `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
3. **Cambiar el driver adapter** en `src/lib/db.ts`: reemplazar
   `@prisma/adapter-better-sqlite3` por `@prisma/adapter-pg`:
   ```bash
   npm install @prisma/adapter-pg pg
   npm uninstall @prisma/adapter-better-sqlite3 better-sqlite3
   ```
   ```ts
   import { PrismaPg } from "@prisma/adapter-pg";
   import { PrismaClient } from "@/generated/prisma/client";

   function createClient() {
     const url = process.env.DATABASE_URL;
     if (!url) throw new Error("Falta DATABASE_URL en las variables de entorno");
     const adapter = new PrismaPg({ connectionString: url });
     return new PrismaClient({ adapter });
   }
   // ... el resto del archivo queda igual
   ```
4. **Migrar el schema a la base de Neon**:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
5. **Subir el proyecto a GitHub** y crear un proyecto nuevo en
   [vercel.com](https://vercel.com) importando ese repo.
6. **Variables de entorno en Vercel** (Project Settings → Environment
   Variables): `DATABASE_URL` (la de Neon), `ADMIN_PASSCODE`, `SESSION_SECRET`.
7. Deploy. Los links `/r/[token]` van a funcionar con el dominio que te da
   Vercel (o el que configures).

La creación de las cuentas de GitHub/Vercel/Neon y el login en esos sitios
los hace el entrenador — esto es solo la guía de los pasos técnicos.
