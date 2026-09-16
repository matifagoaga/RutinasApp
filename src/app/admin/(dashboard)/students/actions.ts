"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { createStudent } from "@/lib/data";

export async function createStudentAction(formData: FormData) {
  await requireAdminSession();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("El nombre es obligatorio");
  }

  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const student = await createStudent({
    name,
    email: email || null,
    phone: phone || null,
  });

  revalidatePath("/admin");
  redirect(`/admin/students/${student.id}`);
}
