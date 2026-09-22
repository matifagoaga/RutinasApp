"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import {
  addTesteoSession,
  deleteStudent,
  logBodyMetric,
  registerPayment,
  setStudentAttentionNote,
  setStudentTeam,
  type TesteoSessionEntryInput,
} from "@/lib/data";

export async function logBodyMetricAction(studentId: string, formData: FormData) {
  await requireAdminSession();

  const weightRaw = String(formData.get("weightKg") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const weightKg = weightRaw ? Number(weightRaw) : null;

  if (weightRaw && Number.isNaN(weightKg)) {
    throw new Error("Peso inválido");
  }

  await logBodyMetric(studentId, { weightKg, notes: notes || null });
  revalidatePath(`/admin/students/${studentId}`);
}

export async function registerPaymentAction(studentId: string, formData: FormData) {
  await requireAdminSession();

  const month = String(formData.get("month") ?? "").trim();
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error("Elegí un mes válido");
  }

  const amountRaw = String(formData.get("amount") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const amount = amountRaw ? Number(amountRaw) : null;

  if (amountRaw && Number.isNaN(amount)) {
    throw new Error("Monto inválido");
  }

  await registerPayment(studentId, { month, amount, notes: notes || null });
  revalidatePath(`/admin/students/${studentId}`);
}

export async function setAttentionNoteAction(studentId: string, formData: FormData) {
  await requireAdminSession();
  const note = String(formData.get("note") ?? "").trim();
  await setStudentAttentionNote(studentId, note || null);
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin");
}

export async function clearAttentionNoteAction(studentId: string) {
  await requireAdminSession();
  await setStudentAttentionNote(studentId, null);
  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin");
}

export async function setStudentTeamAction(studentId: string, teamId: string) {
  await requireAdminSession();
  await setStudentTeam(studentId, teamId || null);
  revalidatePath(`/admin/students/${studentId}`);
}

export async function addTesteoSessionAction(
  studentId: string,
  date: string,
  sessionLabel: string,
  entries: TesteoSessionEntryInput[]
) {
  await requireAdminSession();

  const cleanEntries = entries
    .map((e) => ({ name: e.name.trim(), value: e.value.trim() }))
    .filter((e) => e.name && e.value);
  if (cleanEntries.length === 0) throw new Error("Agregá al menos un test con nombre y valor");

  await addTesteoSession(studentId, {
    // "YYYY-MM-DD" a secas se interpreta como medianoche UTC, lo que corre la
    // fecha al día anterior en husos horarios negativos (ej. Argentina). Le
    // agregamos el mediodía local para evitar el corrimiento.
    date: date ? new Date(`${date}T12:00:00`) : new Date(),
    sessionLabel: sessionLabel.trim() || null,
    entries: cleanEntries,
  });
  revalidatePath(`/admin/students/${studentId}`);
}

export async function deleteStudentAction(studentId: string) {
  await requireAdminSession();
  await deleteStudent(studentId);
  revalidatePath("/admin");
  redirect("/admin");
}
