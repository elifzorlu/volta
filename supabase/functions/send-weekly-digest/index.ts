import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

declare const Deno: any;

serve(async (req) => {
  // ✅ CORS preflight
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }

  try {
    const { email, userName, weeklyStats, startDate, endDate } = await req?.json();

    if (!email) {
      throw new Error('Email is required');
    }

    // Get Resend API key from environment
    const resendApiKey = Deno?.env?.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #000000; color: #EDEDED; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 40px; }
            .header h1 { color: #39FF88; font-size: 32px; margin: 0; font-family: 'JetBrains Mono', monospace; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .stat-card { background: #111111; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 20px; text-align: center; }
            .stat-value { font-size: 36px; font-weight: bold; color: #39FF88; margin: 10px 0; }
            .stat-label { font-size: 14px; color: rgba(237, 237, 237, 0.6); text-transform: uppercase; letter-spacing: 1px; }
            .message { background: #1A1A1A; border-radius: 12px; padding: 24px; margin: 30px 0; line-height: 1.6; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.06); color: rgba(237, 237, 237, 0.6); font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ Volta Weekly Digest</h1>
              <p style="color: rgba(237, 237, 237, 0.6); margin-top: 10px;">${startDate} - ${endDate}</p>
            </div>
            
            <div class="message">
              <p>Hi ${userName || 'there'},</p>
              <p>Here's your weekly productivity summary. Keep up the momentum! 🚀</p>
            </div>

            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">Total Focus Hours</div>
                <div class="stat-value">${weeklyStats?.totalHours || 0}h</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Completed Sessions</div>
                <div class="stat-value">${weeklyStats?.completedSessions || 0}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Productivity Score</div>
                <div class="stat-value">${weeklyStats?.avgScore || 0}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Active Days</div>
                <div class="stat-value">${weeklyStats?.activeDays || 0}/7</div>
              </div>
            </div>

            <div class="message">
              <p><strong>Top Category:</strong> ${weeklyStats?.topCategory || 'N/A'}</p>
              <p><strong>Best Day:</strong> ${weeklyStats?.bestDay || 'N/A'}</p>
              <p style="margin-top: 20px; color: #39FF88;">"${weeklyStats?.insight || 'Keep building your focus habits one day at a time.'}"</p>
            </div>

            <div class="footer">
              <p>This is your weekly digest from Volta</p>
              <p>Stay focused. Stay intentional.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: email,
        subject: `⚡ Your Volta Weekly Digest - ${startDate} to ${endDate}`,
        html: emailHtml
      })
    });

    const resendData = await resendResponse?.json();

    if (!resendResponse?.ok) {
      throw new Error(resendData.message || 'Failed to send email');
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: resendData.id,
      message: 'Weekly digest sent successfully'
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});