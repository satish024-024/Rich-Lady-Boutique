import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { cmsRegistrySchema } from "@/utils/validation";
import { revalidateTag } from "next/cache";

// GET: Retrieve a specific setting from cms_registry
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: "MISSING_ID", message: "Missing settings identifier" }
      }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("cms_registry")
      .select("content")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_FETCH_ERROR", message: error.message }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Settings registry retrieved",
      data: data?.content || {}
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    }, { status: 500 });
  }
}

// PATCH: Update settings registry and snapshot version
export async function PATCH(request: Request) {
  try {
    const { id, type, content, version } = await request.json();

    if (!id || !type || !content) {
      return NextResponse.json({
        success: false,
        error: { code: "MISSING_FIELDS", message: "Missing required parameters (id, type, content)" }
      }, { status: 400 });
    }

    // 1. Fetch current setting version for Optimistic Locking
    const { data: current, error: fetchErr } = await supabaseServer
      .from("cms_registry")
      .select("version, content")
      .eq("id", id)
      .single();

    let expectedVersion = 1;
    if (current) {
      expectedVersion = current.version;
      // Optimistic Locking check
      if (version !== undefined && expectedVersion !== version) {
        return NextResponse.json({
          success: false,
          error: { code: "VERSION_CONFLICT", message: "Conflict: This setting was updated by another administrator. Please refresh and retry." }
        }, { status: 409 });
      }
    }

    const nextVersion = expectedVersion + 1;

    // 2. Commit update to cms_registry
    const { error: updateErr } = await supabaseServer
      .from("cms_registry")
      .upsert({
        id,
        type,
        content,
        version: nextVersion,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (updateErr) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_UPDATE_ERROR", message: updateErr.message }
      }, { status: 500 });
    }

    // 3. Snapshot to cms_registry_versions for audit trail
    await supabaseServer
      .from("cms_registry_versions")
      .insert({
        registry_id: id,
        content
      });

    // Invalidate revalidation tag
    revalidateTag("cms", "default");

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: { version: nextVersion }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    }, { status: 500 });
  }
}
