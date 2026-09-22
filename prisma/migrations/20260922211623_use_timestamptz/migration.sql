-- Convertimos las columnas DateTime de "timestamp without time zone" a
-- "timestamptz" para que dejen de ser ambiguas: sin este tipo, el mismo
-- valor guardado se lee distinto según la zona horaria del proceso que lo
-- lee (dev local vs. Vercel), lo que corría fechas y desordenaba listas
-- ordenadas por fecha cuando ambos entornos no coincidían.
--
-- Los datos existentes se guardaron siempre a través de la app, cuya
-- sesión de conexión usa timezone GMT (confirmado con SHOW TIMEZONE), así
-- que reinterpretamos los valores naive como UTC explícitamente en vez de
-- dejar que Postgres use el timezone de la sesión que corre esta migración
-- (que podría no ser UTC y volver a correr las fechas en esta conversión).

-- AlterTable
ALTER TABLE "BodyMetric" ALTER COLUMN "date" TYPE TIMESTAMPTZ(3) USING "date" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "ExerciseTemplate" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "paidAt" TYPE TIMESTAMPTZ(3) USING "paidAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Routine" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "RoutineTemplate" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "Testeo"
  ALTER COLUMN "date" TYPE TIMESTAMPTZ(3) USING "date" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "WorkoutLog" ALTER COLUMN "date" TYPE TIMESTAMPTZ(3) USING "date" AT TIME ZONE 'UTC';
