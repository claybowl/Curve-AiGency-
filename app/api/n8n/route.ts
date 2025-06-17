import { NextResponse } from "next/server"

export const maxDuration = 60 // Extend max duration for potentially long n8n workflows

/**
 * This API route acts as a secure proxy to your n8n webhook.
 * It forwards the conversation history from the client to n8n.
 *
 * Environment Variables:
 * 1. N8N_WEBHOOK_URL: The full URL of your n8n webhook.
 * 2. N8N_API_KEY: (Optional) A secret key for authenticating with your n8n webhook.
 */
export async function POST(req: Request) {
  try {
    // The frontend sends the entire conversation context
    const { sessionId, userId, messages } = await req.json()

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL is not configured on the server.")
      return NextResponse.json({ error: "Integration endpoint is not configured on the server." }, { status: 500 })
    }

    console.log(`Sending request to n8n webhook: ${n8nWebhookUrl}`)
    console.log(`Payload:`, { sessionId, userId, messages: messages.slice(-2) }) // Log last 2 messages for debugging

    // Forward the request to the n8n webhook with the specified payload
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(n8nApiKey && { "X-N8N-API-KEY": n8nApiKey }),
      },
      body: JSON.stringify({
        sessionId,
        userId,
        messages,
      }),
    })

    console.log(`n8n response status: ${n8nResponse.status}`)
    console.log(`n8n response headers:`, Object.fromEntries(n8nResponse.headers.entries()))

    // Get the response text first, then try to parse it as JSON
    const responseText = await n8nResponse.text()
    console.log(`n8n raw response:`, responseText)

    if (!n8nResponse.ok) {
      console.error(`n8n webhook returned an error: ${n8nResponse.status}`, responseText)
      return NextResponse.json(
        {
          response: `The n8n service returned an error (${n8nResponse.status}). This might indicate your workflow isn't active or has an issue.`,
          error: `HTTP ${n8nResponse.status}: ${responseText || n8nResponse.statusText}`,
          troubleshooting: [
            "Check if your n8n workflow is active and saved",
            "Verify the webhook URL is correct",
            "Ensure your workflow has a 'Respond to Webhook' node",
            "Check n8n execution logs for errors",
          ],
        },
        { status: 200 }, // Return 200 to show the error message in chat
      )
    }

    // Check if the response is empty
    if (!responseText || responseText.trim() === "") {
      console.error("n8n webhook returned an empty response")
      return NextResponse.json(
        {
          response:
            "I received your message, but the n8n workflow returned an empty response. This usually means your workflow isn't configured to respond to webhooks properly.",
          error: "Empty response from n8n webhook",
          troubleshooting: [
            "Your n8n workflow must end with a 'Respond to Webhook' node",
            'The \'Respond to Webhook\' node should return JSON: {"response": "Your message here"}',
            "Make sure your workflow is active (not paused)",
            "Check if there are any errors in your n8n workflow execution",
            "Verify your webhook URL is correct: " + n8nWebhookUrl,
          ],
        },
        { status: 200 },
      )
    }

    // Try to parse the response as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse n8n response as JSON:", parseError, "Raw response:", responseText)

      // If parsing fails, return the raw text as the response
      return NextResponse.json(
        {
          response: `The n8n workflow responded with: "${responseText.substring(0, 500)}"`,
          warning:
            "The n8n webhook returned a non-JSON response. Your workflow should return a JSON object with a 'response' property.",
          troubleshooting: [
            "Your 'Respond to Webhook' node should return JSON format",
            'Example: {"response": "Your AI agent\'s response here"}',
            "Current response was plain text: " + responseText.substring(0, 100) + "...",
          ],
        },
        { status: 200 },
      )
    }

    // If we got a JSON response but it doesn't have a 'response' property,
    // wrap it in a proper format
    if (data && typeof data === "object" && !data.response) {
      console.warn("n8n webhook returned JSON without a 'response' property:", data)

      // Try to extract a meaningful response from common n8n response formats
      let extractedResponse = "Received a response from n8n"

      if (data.message) {
        extractedResponse = data.message
      } else if (data.output) {
        extractedResponse = data.output
      } else if (data.result) {
        extractedResponse = data.result
      } else if (data.text) {
        extractedResponse = data.text
      } else {
        extractedResponse = `The workflow responded with: ${JSON.stringify(data)}`
      }

      return NextResponse.json(
        {
          response: extractedResponse,
          originalResponse: data,
          warning:
            "The n8n webhook returned JSON without a 'response' property. Your workflow should return a JSON object with a 'response' property.",
          troubleshooting: [
            'Update your \'Respond to Webhook\' node to return: {"response": "Your message here"}',
            "Current response format: " + JSON.stringify(data, null, 2),
          ],
        },
        { status: 200 },
      )
    }

    // Return the properly formatted response
    console.log("Successfully processed n8n response:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error proxying request to n8n:", error)
    return NextResponse.json(
      {
        response:
          "Sorry, I encountered an error connecting to the n8n service. Please check your configuration and try again.",
        error: error instanceof Error ? error.message : "Unknown error",
        troubleshooting: [
          "Check if your n8n instance is running and accessible",
          "Verify the N8N_WEBHOOK_URL environment variable is set correctly",
          "Ensure your n8n workflow is active and properly configured",
          "Check the server logs for more detailed error information",
        ],
      },
      { status: 200 }, // Return 200 so the error message shows in chat
    )
  }
}
