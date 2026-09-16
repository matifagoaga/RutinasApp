export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}
