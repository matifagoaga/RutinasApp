"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { deleteStudent, logBodyMetric, registerPayment, setStudentAttentionNote } from "@/lib/data";

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

export async function deleteStudentAction(studentId: string) {
  await requireAdminSession();
  await deleteStudent(studentId);
  revalidatePath("/admin");
  redirect("/admin");
}
