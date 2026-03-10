import { NextResponse } from "next/server";
import { sendUserNotification } from "@/lib/mailer";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
    try {
        const { userId, userEmail, reportTitle, reportId, status, message } = await req.json();

        if (!reportTitle || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Send Email (Only if email is provided)
        if (userEmail) {
            try {
                await sendUserNotification(userEmail, {
                    title: reportTitle,
                    status: status,
                    message: message,
                    reportId: reportId
                });
            } catch (mailError) {
                console.error("Error sending user email:", mailError);
                // Non-blocking, continue to in-app notification
            }
        } else {
            console.warn(`Skipping email notification for user ${userId} because email is missing.`);
        }

        // 2. Create in-app notification in DB
        if (userId) {
            const supabase = getSupabaseClient();
            const { error: dbError } = await supabase.from("notifications").insert({
                user_id: userId,
                title: `Update Laporan: ${status}`,
                message: `Laporan "${reportTitle}" Anda telah mendapatkan pembaruan: ${message}`,
                type: status.toLowerCase() === "selesai" ? "success" : "info",
                complaint_id: reportId
            });

            if (dbError) {
                console.error("Error inserting notification to DB:", dbError);
                return NextResponse.json({ error: "Failed to save in-app notification", details: dbError }, { status: 500 });
            }
        } else {
            console.warn("Skipping in-app notification because userId is missing.");
        }

        return NextResponse.json({ message: "Notifications processed successfully" });
    } catch (error) {
        console.error("Error in notify-user API:", error);
        return NextResponse.json({ error: "Failed to process notifications" }, { status: 500 });
    }
}
