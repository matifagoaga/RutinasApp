# Atlas

Herramienta para cargar rutinas de gimnasio a tus alumnos, seguir su progreso
(peso corporal y entrenamientos completados) y compartírselas online mediante
un link personal por alumno, con opción de exportar a PDF.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma 7 (con driver adapters) + PostgreSQL en Neon
- Autenticación simple por passcode para `/admin` (pensado para un solo entrenador)

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). La primera vez te va a pedir
la contraseña de `/admin` (variable `ADMIN_PASSCODE` en `.env.local`).

Variables de entorno (ver `.env.example`):

- `DATABASE_URL` — connection string de Postgres (Neon). Se usa la misma base
  en local y en producción.
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

- **`/admin`** (protegido por passcode): barra lateral con los alumnos, alta
  de alumnos, carga y edición de rutinas (por días, con bloques opcionales
  para ejercicios en circuito/superserie), registro de peso corporal, e
  historial de entrenamientos completados.
- **`/r/[token]`** (público, sin login): cada alumno tiene un link único desde
  el botón "Copiar link del alumno" en su ficha. Ahí ve su rutina activa,
  puede marcar el día como completado y registrar su peso.
- **Exportar a PDF**: el botón "Descargar PDF" (en admin y en la vista del
  alumno) usa la impresión del navegador (`window.print()`) con estilos que
  ocultan botones y formularios, dejando solo la rutina.
- Cada vez que guardás una rutina nueva para un alumno, la anterior queda en
  el historial (no se borra) y la nueva pasa a ser la activa.

## Deploy a producción (Vercel)

La base de datos (Neon) ya está conectada y migrada. Para publicar la app:

1. **Subir el proyecto a GitHub** (ya hecho: [github.com/matifagoaga/RutinasApp](https://github.com/matifagoaga/RutinasApp)).
2. Crear un proyecto nuevo en [vercel.com](https://vercel.com) importando ese repo.
3. **Variables de entorno en Vercel** (Project Settings → Environment
   Variables): copiar `DATABASE_URL`, `ADMIN_PASSCODE` y `SESSION_SECRET`
   desde el `.env` / `.env.local` local.
4. Deploy. Los links `/r/[token]` van a funcionar con el dominio que te da
   Vercel (o el que configures).

La creación de la cuenta de Vercel y el login la hace el entrenador — esto
es solo la guía de los pasos técnicos.
