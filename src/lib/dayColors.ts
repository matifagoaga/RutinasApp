export type DayPalette = {
  header: string;
  badge: string;
  border: string;
  ring: string;
};

const dayPalette: DayPalette[] = [
  {
    header: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    badge: "bg-indigo-600",
    border: "border-indigo-200 dark:border-indigo-900",
    ring: "ring-indigo-500",
  },
  {
    header: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    badge: "bg-orange-500",
    border: "border-orange-200 dark:border-orange-900",
    ring: "ring-orange-500",
  },
  {
    header: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    badge: "bg-emerald-600",
    border: "border-emerald-200 dark:border-emerald-900",
    ring: "ring-emerald-500",
  },
  {
    header: "bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    badge: "bg-fuchsia-600",
    border: "border-fuchsia-200 dark:border-fuchsia-900",
    ring: "ring-fuchsia-500",
  },
  {
    header: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    badge: "bg-sky-600",
    border: "border-sky-200 dark:border-sky-900",
    ring: "ring-sky-500",
  },
];

export function getDayPalette(index: number): DayPalette {
  return dayPalette[index % dayPalette.length];
}
