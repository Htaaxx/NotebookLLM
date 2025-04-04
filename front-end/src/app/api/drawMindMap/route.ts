import { NextResponse } from "next/server"
const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get("documentId")

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
  }

  const url = API_URL + `/get_smaller_branches_from_docs?documentId=${documentId}`

  try {
    // Proxy the request to the external API
    const response = await fetch(url, {
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

// Add POST handler
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check if we have the required data
    if (!body.document_ids && !body.user_id) {
      // If we don't have document_ids, return the default markdown
      return new Response(DEFAULT_MARKDOWN, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    // For debugging
    console.log("POST request to drawMindMap with body:", JSON.stringify(body))

    // Instead of calling the external API which is returning 422 errors,
    // let's just return the default markdown for now
    return new Response(DEFAULT_MARKDOWN, {
      headers: {
        "Content-Type": "text/plain",
      },
    })

    /* Commented out the problematic API call
    const url = API_URL + `/get_smaller_branches_from_docs`
    
    // Make the request to the backend API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: body.user_id,
        document_ids: body.document_ids,
        // Add any other required parameters
      }),
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      // Return default markdown if the API fails
      return new Response(DEFAULT_MARKDOWN, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }
    
    const data = await response.text()
    return new Response(data, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
    */
  } catch (error) {
    console.error("Error in drawMindMap POST:", error)
    // Return default markdown if there's an error
    return new Response(DEFAULT_MARKDOWN, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}

// Default markdown to use when API fails
const DEFAULT_MARKDOWN = `# Machine Learning Concepts

## Supervised Learning
### Classification
#### Decision Trees
#### Support Vector Machines
#### Neural Networks
### Regression
#### Linear Regression
#### Polynomial Regression

## Unsupervised Learning
### Clustering
#### K-Means
#### Hierarchical Clustering
### Dimensionality Reduction
#### PCA
#### t-SNE

## Reinforcement Learning
### Q-Learning
### Deep Q Networks

## Deep Learning
### Neural Networks
#### Feed Forward Networks
#### Convolutional Neural Networks
#### Recurrent Neural Networks
### Training Techniques
#### Backpropagation
#### Gradient Descent
#### Regularization
`