import { NextResponse } from "next/server";
import { getUserFromSessionToken, readSessionToken } from "../../../../../lib/auth";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // ── 1. Authenticate ─────────────────────────────────────────────────────────
  const token = readSessionToken(request.headers.get("cookie"));
  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const user = await getUserFromSessionToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const projectId = params.id;

  // ── 2. Parse & validate request body ────────────────────────────────────────
  let body: { submission_summary?: string; deliverable_url?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const summary = (body.submission_summary ?? "").trim();
  const url = (body.deliverable_url ?? "").trim();

  if (!summary) {
    return NextResponse.json(
      { error: "A written summary of the work done is required." },
      { status: 422 }
    );
  }

  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      { error: "A valid deliverable URL (starting with http:// or https://) is required." },
      { status: 422 }
    );
  }

  // ── 3. Verify the project exists and is strictly in_progress ────────────────
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("id, status")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (project.status !== "in_progress") {
    return NextResponse.json(
      { error: "Submissions can only be made for projects that are currently in progress." },
      { status: 409 }
    );
  }

  // ── 4. Insert submission record ──────────────────────────────────────────────
  const { data: submission, error: insertError } = await supabaseAdmin
    .from("submissions")
    .insert({
      project_id: projectId,
      student_id: user.id,
      submission_summary: summary,
      deliverable_url: url,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[submit] insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to record submission. Please try again." },
      { status: 500 }
    );
  }

  // ── 5. Update project status to under_review ─────────────────────────────────
  const { error: updateError } = await supabaseAdmin
    .from("projects")
    .update({ status: "under_review" })
    .eq("id", projectId);

  if (updateError) {
    console.error("[submit] status update error:", updateError);
    // Submission was recorded; status update failed — non-fatal, still return success.
  }

  return NextResponse.json({ submission }, { status: 201 });
}
