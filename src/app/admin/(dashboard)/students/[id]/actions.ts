"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import {
  addTesteo,
  deleteStudent,
  logBodyMetric,
  registerPayment,
  setStudentAttentionNote,
  setStudentTeam,
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

export async function addTesteoAction(studentId: string, formData: FormData) {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del testeo es obligatorio");

  const value = String(formData.get("value") ?? "").trim();
  if (!value) throw new Error("El valor es obligatorio");

  const dateRaw = String(formData.get("date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  await addTesteo(studentId, {
    name,
    value,
    // "YYYY-MM-DD" a secas se interpreta como medianoche UTC, lo que corre la
    // fecha al día anterior en husos horarios negativos (ej. Argentina). Le
    // agregamos el mediodía local para evitar el corrimiento.
    date: dateRaw ? new Date(`${dateRaw}T12:00:00`) : undefined,
    notes: notes || null,
  });
  revalidatePath(`/admin/students/${studentId}`);
}

export async function deleteStudentAction(studentId: string) {
  await requireAdminSession();
  await deleteStudent(studentId);
  revalidatePath("/admin");
  redirect("/admin");
}
