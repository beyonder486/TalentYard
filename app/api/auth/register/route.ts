import { NextResponse } from "next/server";
import { createSessionCookie, createUser, isUniversityEmail, signSessionToken } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: string; email?: string; password?: string; role?: string }
    | null;

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  const role = body?.role?.trim() ?? "";

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Full Name, Email, Password, and Role are required." }, { status: 400 });
  }

  if (!isUniversityEmail(email)) {
    return NextResponse.json({ error: "Please use a valid university email address ending in .edu." }, { status: 400 });
  }

  if (password.length < 10) {
    return NextResponse.json({ error: "Password must be at least 10 characters long." }, { status: 400 });
  }

  try {
    const result = await createUser({ name, email, password, role });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const token = signSessionToken(result.user);
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    response.headers.set("Set-Cookie", createSessionCookie(token));
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : error && typeof error === "object"
        ? JSON.stringify(error)
        : "Registration failed due to an unexpected server error.";
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}