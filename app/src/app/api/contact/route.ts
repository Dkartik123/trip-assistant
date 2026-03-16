import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, agency, message } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_EMAIL || "denis@llmsolution.eu";

    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Trip Assistant <onboarding@resend.dev>",
      to: toEmail,
      subject: `[Trip Assistant] Demo request from ${name}`,
      text: [
        `New demo request:`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Agency: ${agency || "Not specified"}`,
        `Message: ${message || "No message"}`,
        ``,
        `---`,
        `Sent from trip.llmsolution.eu landing page`,
      ].join("\n"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
