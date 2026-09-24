"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTrainerSession } from "@/lib/auth";
import { createStudent, createTeam, deleteTeam } from "@/lib/data";

export async function createTeamAction(formData: FormData) {
  const { trainerId } = await requireTrainerSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre del equipo es obligatorio");

  const team = await createTeam(name, trainerId);
  revalidatePath("/admin/teams");
  redirect(`/admin/teams/${team.id}`);
}

export async function deleteTeamAction(teamId: string) {
  const { trainerId } = await requireTrainerSession();
  await deleteTeam(teamId, trainerId);
  revalidatePath("/admin/teams");
  redirect("/admin/teams");
}

export async function createPlayerAction(teamId: string, formData: FormData) {
  const { trainerId } = await requireTrainerSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es obligatorio");

  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const player = await createStudent(trainerId, {
    name,
    email: email || null,
    phone: phone || null,
    notes: notes || null,
    teamId,
  });

  revalidatePath(`/admin/teams/${teamId}`);
  redirect(`/admin/students/${player.id}`);
}
