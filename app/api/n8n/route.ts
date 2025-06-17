import { NextResponse } from "next/server"

export const maxDuration = 60 // Extend max duration for potentially long n8n workflows

/**
 * This API route acts as a secure proxy to your n8n webhook.
 * It forwards requests from the client, adding necessary authentication,
 * and then sends the response from n8n back to the client.
 *
 * IMPORTANT: You must configure the following environment variables in your Vercel project:
 * 1. N8N_WEBHOOK_URL: The full URL of your n8n webhook that listens for agent tasks.
 * 2. N8N_API_KEY: (Optional but recommended) A secret key to authenticate requests to your n8n webhook.
 *    You should check for this key in your n8n workflow using the 'X-N8N-API-KEY' header.
 */
export async function POST(req: Request) {
  try {
    const { prompt, agentConfig, systemSettings } = await req.json()

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL is not configured on the server.")
      return NextResponse.json(
        { error: "Integration endpoint is not configured on the server. Please contact an administrator." },
        { status: 500 },
      )
    }

    // Forward the request to the n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add the API key to the header if it's configured, for securing your n8n webhook
        ...(n8nApiKey && { "X-N8N-API-KEY": n8nApiKey }),
      },
      body: JSON.stringify({
        prompt,
        agent: agentConfig, // Pass the full agent config from settings
        settings: systemSettings, // Pass global system settings
      }),
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error(`n8n webhook returned an error: ${n8nResponse.status}`, errorText)
      return NextResponse.json(
        { error: `An error occurred with the connected service: ${errorText}` },
        { status: n8nResponse.status },
      )
    }

    const data = await n8nResponse.json()

    // Assuming n8n returns a JSON object. We will pass it through.
    // Your n8n workflow should ideally return a consistent object, e.g., { "output": "..." }
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying request to n8n:", error)
    return NextResponse.json({ error: "Failed to connect to the integration service." }, { status: 500 })
  }
}
