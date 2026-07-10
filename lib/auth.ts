import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabaseAdmin";

const AUTH_SECRET = process.env.AUTH_SECRET || "talentyard-dev-secret";
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_DIGEST = "sha512";
const SESSION_COOKIE_NAME = "ty_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type UserRole = "Student" | "Freelancer" | "Client" | "Mentor";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StoredUser extends PublicUser {
  passwordHash: string;
  passwordSalt: string;
  passwordIterations: number;
  createdAt: string;
}

interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  exp: number;
}

function base64UrlEncode(value: Buffer | string) {
  const buffer = typeof value === "string" ? Buffer.from(value) : value;
  return buffer.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isUniversityEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.edu$/i.test(email.trim());
}

export function generateUserId(email: string) {
  const digest = createHmac("sha256", AUTH_SECRET).update(normalizeEmail(email)).digest("hex");
  return `u_${digest.slice(0, 16)}`;
}

function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST).toString("hex");
}

export function createPasswordRecord(password: string) {
  const salt = randomBytes(16).toString("hex");
  return {
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    passwordIterations: PASSWORD_ITERATIONS,
  };
}

export function verifyPassword(password: string, user: Pick<StoredUser, "passwordHash" | "passwordSalt" | "passwordIterations">) {
  const candidate = pbkdf2Sync(
    password,
    user.passwordSalt,
    user.passwordIterations,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST
  );
  const stored = Buffer.from(user.passwordHash, "hex");
  const storedBytes = new Uint8Array(stored.buffer, stored.byteOffset, stored.byteLength);
  const candidateBytes = new Uint8Array(candidate.buffer, candidate.byteOffset, candidate.byteLength);
  return (
    stored.length === candidate.length &&
    timingSafeEqual(storedBytes, candidateBytes)
  );
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id,name,email,role,passwordHash,passwordSalt,passwordIterations,createdAt")
    .eq("email", normalizedEmail)
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return (data as StoredUser) ?? null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const email = normalizeEmail(input.email);
  const existing = await findUserByEmail(email);

  if (existing) {
    return { error: "An account with this email already exists." as const };
  }

  const passwordRecord = createPasswordRecord(input.password);
  const userToInsert: StoredUser = {
    id: generateUserId(email),
    name: input.name.trim(),
    email,
    role: input.role.trim(),
    ...passwordRecord,
    createdAt: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("users")
    .insert(userToInsert)
    .select("id,name,email,role")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "An account with this email already exists." as const };
    }
    return {
      error:
        error.message ||
        error.details ||
        "Registration failed due to a database error.",
    };
  }

  if (!data) {
    return { error: "Registration failed: no user record was returned." as const };
  }

  return { user: toPublicUser(data as Pick<StoredUser, "id" | "name" | "email" | "role">) };
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user)) {
    return null;
  }

  return toPublicUser(user);
}

export function toPublicUser(user: Pick<StoredUser, "id" | "name" | "email" | "role">): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function signSessionToken(user: PublicUser) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", AUTH_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export async function getUserFromSessionToken(token: string) {
  const [headerPart, bodyPart, signaturePart] = token.split(".");

  if (!headerPart || !bodyPart || !signaturePart) {
    return null;
  }

  const expectedSignature = createHmac("sha256", AUTH_SECRET).update(`${headerPart}.${bodyPart}`).digest("base64url");
  if (expectedSignature !== signaturePart) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(bodyPart)) as SessionPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  const user = await findUserByEmail(payload.email);
  if (!user || user.id !== payload.sub) {
    return null;
  }

  return toPublicUser(user);
}

export function createSessionCookie(token: string) {
  const maxAge = SESSION_TTL_SECONDS;
  const secure = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function readSessionToken(cookieHeader: string | null) {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}