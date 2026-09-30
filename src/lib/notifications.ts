import { Resend } from "resend";
import { formatDate } from "@/lib/format";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Falta RESEND_API_KEY en las variables de entorno");
  return new Resend(apiKey);
}

// onboarding@resend.dev es el remitente "sandbox" de Resend: mientras no se
// verifique un dominio propio, sólo entrega a la dirección dueña de la
// cuenta de Resend — el resto de los envíos se descartan del lado de Resend.
// El código de acá es genérico (usa trainer.email/trainer.name siempre), así
// que apenas se verifique un dominio y se cambie este FROM, funciona para
// todos los entrenadores sin tocar nada más.
const FROM_ADDRESS = "Atlas <onboarding@resend.dev>";

export async function notifyWorkoutCompleted(
  trainerEmail: string,
  trainerName: string,
  studentName: string,
  dayLabel: string | null,
  date: Date
) {
  const resend = getResendClient();
  const when = formatDate(date);
  const what = dayLabel ? `"${dayLabel}"` : "un entrenamiento";

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: trainerEmail,
    subject: `${studentName} completó un entrenamiento`,
    text: `Hola ${trainerName},\n\n${studentName} marcó ${what} como completado el ${when}.\n\n— Atlas`,
  });
}
