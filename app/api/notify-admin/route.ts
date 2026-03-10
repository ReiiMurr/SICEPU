import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import { sendAdminNotification } from "@/lib/mailer";

export async function POST(req: Request) {
    try {
        const { title, location, description, reporter, adminEmail } = await req.json();

        if (!adminEmail) {
            return NextResponse.json({ error: "Admin email is required" }, { status: 400 });
        }

        await sendAdminNotification(adminEmail, {
            title,
            location,
            reporter,
            description
        });

        return NextResponse.json({ message: "Notification sent successfully" });
    } catch (error) {
        console.error("Error sending admin notification:", error);
        return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
}
