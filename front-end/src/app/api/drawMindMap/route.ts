import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get("documentId")

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
  }

  try {
    // Proxy the request to the external API
    const response = await fetch(`http://localhost:8000/get_smaller_branches_from_docs?documentId=${documentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`External API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching mindmap data:", error)
    return NextResponse.json({ error: "Failed to fetch mindmap data" }, { status: 500 })
  }
}

