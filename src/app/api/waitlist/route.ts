import { NextRequest, NextResponse } from "next/server";
import { addToWaitlist } from "@/lib/loops";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, platform } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!platform || !["macos", "linux"].includes(platform)) {
      return NextResponse.json(
        { success: false, error: "Invalid platform. Must be 'macos' or 'linux'" },
        { status: 400 }
      );
    }

    const result = await addToWaitlist(email, platform);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
