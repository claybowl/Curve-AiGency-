import { NextResponse } from "next/server"

/**
 * Test endpoint for n8n webhook connection
 * This endpoint tests the connection without affecting real conversations
 */
export async function POST(req: Request) {
  try {
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "N8N_WEBHOOK_URL is not configured on the server.",
          details: "Please set the N8N_WEBHOOK_URL environment variable in your Vercel project settings.",
        },
        { status: 500 },
      )
    }

    // Test payload with a simple message
    const testPayload = {
      sessionId: "test-session-" + Date.now(),
      userId: "test-user",
      messages: [
        {
          role: "user",
          content: "This is a connection test. Please respond with a simple confirmation.",
        },
      ],
    }

    const startTime = Date.now()

    // Make the test request
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(n8nApiKey && { "X-N8N-API-KEY": n8nApiKey }),
      },
      body: JSON.stringify(testPayload),
    })

    const responseTime = Date.now() - startTime

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      return NextResponse.json({
        success: false,
        error: `HTTP ${n8nResponse.status}: ${n8nResponse.statusText}`,
        details: errorText,
        responseTime,
        webhookUrl: n8nWebhookUrl,
        hasApiKey: !!n8nApiKey,
      })
    }

    const data = await n8nResponse.json()

    // Validate response format
    if (!data.response) {
      return NextResponse.json({
        success: false,
        error: "Invalid response format",
        details: "Expected { response: '...' } but received: " + JSON.stringify(data),
        responseTime,
        webhookUrl: n8nWebhookUrl,
        hasApiKey: !!n8nApiKey,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Connection successful",
      response: data.response,
      responseTime,
      webhookUrl: n8nWebhookUrl,
      hasApiKey: !!n8nApiKey,
    })
  } catch (error) {
    console.error("Error testing n8n connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
        webhookUrl: process.env.N8N_WEBHOOK_URL || "Not configured",
        hasApiKey: !!process.env.N8N_API_KEY,
      },
      { status: 500 },
    )
  }
}
