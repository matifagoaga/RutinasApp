import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "atlas_trainer_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

const SCRYPT_KEYLEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Falta SESSION_SECRET en las variables de entorno");
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), SCRYPT_KEYLEN, SCRYPT_PARAMS);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

type SessionPayload = { trainerId: string; iat: number };

export function createSessionToken(trainerId: string) {
  const payload = Buffer.from(JSON.stringify({ trainerId, iat: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function parseSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expectedBuf = Buffer.from(sign(payload));
  const sigBuf = Buffer.from(sig);
  if (expectedBuf.length !== sigBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (typeof data.trainerId !== "string" || typeof data.iat !== "number") return null;
    const ageSeconds = (Date.now() - data.iat) / 1000;
    if (ageSeconds < 0 || ageSeconds > ADMIN_SESSION_MAX_AGE) return null;
    return data;
  } catch {
    return null;
  }
}

/** Para proxy.ts, que recibe el token crudo de la cookie (no tiene acceso a next/headers). */
export function isValidSessionToken(token: string | undefined | null): boolean {
  return parseSessionToken(token) != null;
}

/**
 * La cookie firmada sólo prueba que el token es genuino, no que el entrenador
 * todavía exista (ej. se borró la cuenta con una sesión vieja todavía activa
 * en algún navegador). Sin este chequeo, cualquier operación de datos con ese
 * trainerId revienta más abajo con un error crudo de foreign key.
 */
async function trainerExists(trainerId: string): Promise<boolean> {
  const trainer = await db.trainer.findUnique({ where: { id: trainerId }, select: { id: true } });
  return trainer != null;
}

/**
 * Lanza si no hay una sesión válida. Usar al inicio de cada server action de
 * /admin, y también se usa desde page.tsx (Server Components) — por eso no
 * borra la cookie acá: Next sólo permite modificarla en Server Actions o
 * Route Handlers, y llamarlo también desde un componente rompería el render.
 * La cookie inválida se sobreescribe sola en el próximo login.
 */
export async function requireTrainerSession(): Promise<{ trainerId: string }> {
  const store = await cookies();
  const payload = parseSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
  if (!payload || !(await trainerExists(payload.trainerId))) {
    throw new Error("No autorizado");
  }
  return { trainerId: payload.trainerId };
}

/**
 * Redirige a /admin/login si no hay sesión válida. Usar en el layout y en
 * cada page.tsx de /admin. Se llama desde Server Components (no Server
 * Actions), así que no puede borrar la cookie acá — Next sólo permite
 * modificarla en Server Actions o Route Handlers. El login la sobreescribe
 * en el próximo ingreso; mientras tanto, una cookie inválida simplemente
 * vuelve a rebotar a /admin/login cada vez, sin loop.
 */
export async function requireTrainerSessionOrRedirect(): Promise<{ trainerId: string }> {
  const store = await cookies();
  const payload = parseSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
  if (!payload || !(await trainerExists(payload.trainerId))) {
    redirect("/admin/login");
  }
  return payload;
}
