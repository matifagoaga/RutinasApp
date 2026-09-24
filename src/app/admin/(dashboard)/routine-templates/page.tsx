import { LayoutTemplate } from "lucide-react";
import { requireTrainerSession } from "@/lib/auth";
import { getRoutineTemplates } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { DeleteRoutineTemplateButton } from "@/components/DeleteRoutineTemplateButton";
import { deleteRoutineTemplateAction } from "./actions";

// La lista cambia cada vez que se guarda/borra una plantilla desde el editor
// de rutina; sin esto Next.js la generaría estática y quedaría congelada.
export const dynamic = "force-dynamic";

export default async function RoutineTemplatesPage() {
  const { trainerId } = await requireTrainerSession();
  const templates = await getRoutineTemplates(trainerId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold text-ink">
          <LayoutTemplate className="h-6 w-6 text-ink-muted" strokeWidth={1.75} /> Plantillas de rutina
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Las plantillas se crean desde el editor de rutina de cualquier alumno, con el botón
          &quot;Guardar como plantilla&quot;. Desde ahí también se pueden aplicar para empezar una
          rutina nueva sin armar todo de cero.
        </p>
      </div>

      <section>
        {templates.length === 0 ? (
          <p className="text-sm text-ink-muted">Todavía no guardaste ninguna plantilla.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {templates.map((template) => {
              const exerciseCount = template.days.reduce(
                (total, day) =>
                  total + day.blocks.reduce((sum, block) => sum + block.exercises.length, 0),
                0
              );
              return (
                <li
                  key={template.id}
                  className="flex items-center justify-between gap-4 rounded-card border border-line px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-ink">{template.title}</p>
                    <p className="text-ink-muted">
                      {template.days.length} {template.days.length === 1 ? "día" : "días"} ·{" "}
                      {exerciseCount} {exerciseCount === 1 ? "ejercicio" : "ejercicios"} · guardada
                      el {formatDate(template.createdAt)}
                    </p>
                  </div>
                  <DeleteRoutineTemplateButton
                    templateTitle={template.title}
                    onDelete={deleteRoutineTemplateAction.bind(null, template.id)}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
