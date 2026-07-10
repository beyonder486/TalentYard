import { NextResponse } from "next/server";
import { getUserFromSessionToken, readSessionToken } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = readSessionToken(request.headers.get("cookie"));
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const user = await getUserFromSessionToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  return NextResponse.json({ user });
}