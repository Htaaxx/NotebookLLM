import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()

    // Forward the request to the external API
    const response = await fetch("http://localhost:8000/get_smaller_branches_from_docs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    // Get the response text
    const data = await response.text()

    // Return the response
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Error in drawMindMap API route:", error)
    return NextResponse.json(
      { error: `Failed to fetch mindmap: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

