import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "rutinas_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Falta SESSION_SECRET en las variables de entorno");
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function createSessionToken() {
  const payload = `${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected);
  const sigBuf = Buffer.from(sig);
  if (expectedBuf.length !== sigBuf.length) return false;
  if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) return false;

  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt)) return false;
  const ageSeconds = (Date.now() - issuedAt) / 1000;
  return ageSeconds >= 0 && ageSeconds <= ADMIN_SESSION_MAX_AGE;
}

export function isValidPasscode(input: string): boolean {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) throw new Error("Falta ADMIN_PASSCODE en las variables de entorno");
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);
  if (inputBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(inputBuf, expectedBuf);
}

/** Lanza si no hay una sesión de admin válida. Usar al inicio de cada server action de /admin. */
export async function requireAdminSession() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    throw new Error("No autorizado");
  }
}
