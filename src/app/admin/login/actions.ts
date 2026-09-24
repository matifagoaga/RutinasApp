"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";
import { getTrainerByEmail } from "@/lib/data";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const trainer = email ? await getTrainerByEmail(email) : null;
  if (!trainer || !password || !verifyPassword(password, trainer.passwordHash)) {
    redirect("/admin/login?error=1");
  }

  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, createSessionToken(trainer.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
