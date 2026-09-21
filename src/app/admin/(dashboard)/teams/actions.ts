"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { createStudent, createTeam, deleteTeam } from "@/lib/data";

export async function createTeamAction(formData: FormData) {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del equipo es obligatorio");

  const team = await createTeam(name);
  revalidatePath("/admin/teams");
  redirect(`/admin/teams/${team.id}`);
}

export async function deleteTeamAction(teamId: string) {
  await requireAdminSession();
  await deleteTeam(teamId);
  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}

export async function createPlayerAction(teamId: string, formData: FormData) {
  await requireAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const player = await createStudent({
    name,
    email: email || null,
    phone: phone || null,
    notes: notes || null,
    teamId,
  });

  revalidatePath(`/admin/teams/${teamId}`);
  redirect(`/admin/students/${player.id}`);
}
