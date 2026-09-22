// La app es para un entrenador en Argentina; todas las fechas se muestran e
// interpretan en su huso horario (UTC-3 fijo, sin horario de verano), sin
// depender de la zona horaria ambiente del navegador o del proceso que
// corre el server (que en Vercel suele ser UTC y en dev local puede ser
// otra) — de lo contrario una misma fecha se lee distinto según dónde se
// ejecute el código, corriendo el día o desordenando listas por fecha.
const TIME_ZONE = "America/Argentina/Buenos_Aires";

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
}

// Valor para <input type="date">, en el día calendario de Argentina.
export function toDateInputValue(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

// Interpreta un "YYYY-MM-DD" de un <input type="date"> como esa fecha a
// mediodía en Argentina. El offset explícito evita depender de la zona
// horaria del proceso que ejecuta el server action.
export function parseLocalDateInput(date: string) {
  return date ? new Date(`${date}T12:00:00-03:00`) : new Date();
}

export function isSameDay(a: Date, b: Date) {
  return toDateInputValue(a) === toDateInputValue(b);
}

// Medianoche del día calendario de Argentina que contiene `date`, como
// instante absoluto (para filtros "desde hoy" en queries).
export function startOfLocalDay(date: Date) {
  return new Date(`${toDateInputValue(date)}T00:00:00-03:00`);
}

// Día de la semana (0 = domingo) del día calendario de Argentina que
// contiene `date`. El día-de-semana de una fecha no depende de la hora,
// así que un Date local construido con esos mismos año/mes/día da el
// resultado correcto sin importar el huso horario ambiente.
export function localWeekday(date: Date) {
  const [year, month, day] = toDateInputValue(date).split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

export function getCurrentMonthKey(date = new Date()) {
  return toDateInputValue(date).slice(0, 7);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  if (!year || !month) return monthKey;
  const date = new Date(Date.UTC(year, month - 1, 1, 12));
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
