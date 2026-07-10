import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const type = searchParams.get("type") || "all"; // 'all' | 'email' | 'sms'
    const status = searchParams.get("status") || "all"; // 'all' | 'sent' | 'failed' | 'pending'
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    // 1. Fetch counters (independent of pagination and filters)
    const [
      { count: sentEmails },
      { count: failedEmails },
      { count: sentSms },
      { count: failedSms }
    ] = await Promise.all([
      supabaseServer.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "sent"),
      supabaseServer.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "failed"),
      supabaseServer.from("sms_logs").select("*", { count: "exact", head: true }).eq("status", "sent"),
      supabaseServer.from("sms_logs").select("*", { count: "exact", head: true }).eq("status", "failed"),
    ]);

    const counters = {
      sentEmails: sentEmails || 0,
      failedEmails: failedEmails || 0,
      sentSms: sentSms || 0,
      failedSms: failedSms || 0,
    };

    // 2. Fetch logs based on type filter
    let emailLogs: any[] = [];
    let smsLogs: any[] = [];

    // Helper for adding search filters
    const applyFilters = (queryBuilder: any) => {
      let q = queryBuilder;
      if (status !== "all") {
        q = q.eq("status", status);
      }
      return q;
    };

    const promises: PromiseLike<any>[] = [];

    if (type === "all" || type === "email") {
      let emailQuery = supabaseServer
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false });

      emailQuery = applyFilters(emailQuery);

      if (search) {
        // Search recipient email or order id
        emailQuery = emailQuery.or(`recipient_email.ilike.%${search}%,order_id.ilike.%${search}%`);
      }
      
      // Limit search size to prevent oversized in-memory joins
      promises.push(emailQuery.limit(200).then(r => r.data || []));
    } else {
      promises.push(Promise.resolve([]));
    }

    if (type === "all" || type === "sms") {
      let smsQuery = supabaseServer
        .from("sms_logs")
        .select("*")
        .order("created_at", { ascending: false });

      smsQuery = applyFilters(smsQuery);

      if (search) {
        // Search recipient phone or order id
        smsQuery = smsQuery.or(`recipient_phone.ilike.%${search}%,order_id.ilike.%${search}%`);
      }

      promises.push(smsQuery.limit(200).then(r => r.data || []));
    } else {
      promises.push(Promise.resolve([]));
    }

    const [emailsResult, smsResult] = await Promise.all(promises);
    emailLogs = emailsResult.map((log: any) => ({ ...log, notificationType: "email" }));
    smsLogs = smsResult.map((log: any) => ({ ...log, notificationType: "sms" }));

    // Combine and sort by created_at desc
    const combinedLogs = [...emailLogs, ...smsLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Paginate in-memory
    const totalCount = combinedLogs.length;
    const paginatedLogs = combinedLogs.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      logs: paginatedLogs,
      totalCount,
      counters,
    });
  } catch (error: any) {
    console.error("Error in /api/admin/notifications:", error);
    
    // Catch missing table errors gracefully to keep the dashboard working for local testing
    if (error.code === "PGRST205" || error.message?.includes("email_logs") || error.message?.includes("sms_logs")) {
      console.warn("⚠️ Supabase email_logs/sms_logs tables not found. Returning empty log list for dashboard.");
      return NextResponse.json({
        success: true,
        logs: [],
        totalCount: 0,
        counters: { sentEmails: 0, failedEmails: 0, sentSms: 0, failedSms: 0 },
        note: "Database tables are not initialized in Supabase. Run migrations to see real history.",
      });
    }

    return NextResponse.json({ error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}
