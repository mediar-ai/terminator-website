export async function addToWaitlist(
  email: string,
  platform: "macos" | "linux",
  sendEmail = true
): Promise<{ success: boolean; error?: string }> {
  const userGroup = `terminator_waitlist_${platform}`;

  try {
    // Step 1: Subscribe to newsletter/waitlist
    const subscribeResponse = await fetch(
      "https://app.loops.so/api/newsletter-form/clkotuj73009emj0nyov824h1",
      {
        method: "POST",
        body: `userGroup=${encodeURIComponent(userGroup)}&email=${encodeURIComponent(email)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!subscribeResponse.ok) {
      const status = subscribeResponse.status;
      if (status === 429) {
        return { success: false, error: "Too many requests. Please try again later." };
      }
      if (status === 400) {
        return { success: false, error: "Invalid email address." };
      }
      return { success: false, error: "Failed to join waitlist." };
    }

    // Step 2: Send transactional email to user
    if (sendEmail && process.env.LOOPS_API_KEY && process.env.LOOPS_TRANSACTIONAL_ID) {
      const platformName = platform === "macos" ? "macOS" : "Linux";

      // Email to user
      await fetch("https://app.loops.so/api/v1/transactional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
        },
        body: JSON.stringify({
          transactionalId: process.env.LOOPS_TRANSACTIONAL_ID,
          email,
          dataVariables: {
            subject: `You're on the Terminator ${platformName} waitlist!`,
            email_preview: `We'll notify you when ${platformName} support is ready.`,
            body: `
              <p>Thanks for joining the Terminator ${platformName} waitlist!</p>
              <p>We're actively working on ${platformName} support and will notify you as soon as it's available.</p>
              <p>In the meantime, check out our <a href="https://github.com/mediar-ai/terminator">GitHub repo</a> to follow development progress.</p>
              <p>Best,<br/>The Terminator Team</p>
            `,
            sender_name: "Terminator Team",
            reply_to: "matt@mediar.ai",
          },
        }),
      });

      // Email to admin
      await fetch("https://app.loops.so/api/v1/transactional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
        },
        body: JSON.stringify({
          transactionalId: process.env.LOOPS_TRANSACTIONAL_ID,
          email: "matt@mediar.ai",
          dataVariables: {
            subject: `New Terminator ${platformName} waitlist signup`,
            email_preview: `${email} joined the ${platformName} waitlist`,
            body: `
              <p>New waitlist signup:</p>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Platform:</strong> ${platformName}</li>
                <li><strong>Tag:</strong> ${userGroup}</li>
              </ul>
            `,
            sender_name: "Terminator Waitlist",
            reply_to: email,
          },
        }),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Loops error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
