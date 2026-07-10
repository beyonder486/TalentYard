import { NextResponse } from "next/server";
import { authenticateUser, createSessionCookie, isUniversityEmail, signSessionToken } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;

  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and Password are required." }, { status: 400 });
  }

  if (!isUniversityEmail(email)) {
    return NextResponse.json({ error: "Please use your university email address." }, { status: 400 });
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = signSessionToken(user);
  const response = NextResponse.json({ user });
  response.headers.set("Set-Cookie", createSessionCookie(token));
  return response;
}