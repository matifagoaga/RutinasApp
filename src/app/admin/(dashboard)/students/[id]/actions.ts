"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { deleteStudent, logBodyMetric } from "@/lib/data";

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

export async function deleteStudentAction(studentId: string) {
  await requireAdminSession();
  await deleteStudent(studentId);
  revalidatePath("/admin");
  redirect("/admin");
}
