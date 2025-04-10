const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000"

// Add POST handler
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check if document_ids exists and log it
    if (!body.document_ids) {
      console.error("document_ids is undefined in request body:", body)
      return new Response("Missing document_ids in request body", { status: 400 })
    }

    console.log("Received request body:", body.document_ids)
    const num_clusters = 5

    const url = API_URL + `/get_smaller_branches_from_docs?num_clusters=${num_clusters}`

    // Make the request to the backend API with properly formatted JSON
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Charset": "UTF-8", // Explicitly request UTF-8 encoding
      },
      // Send just the array of document IDs
      body: JSON.stringify(body.document_ids),
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      // Return default markdown if the API fails
      return new Response(DEFAULT_MARKDOWN, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    }

    try {
      // Try to get the response as text
      const data = await response.text()
      return new Response(data, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    } catch (encodingError) {
      console.error("Error processing response text:", encodingError)
      return new Response(DEFAULT_MARKDOWN, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      })
    }
  } catch (error) {
    console.error("Error in drawMindMap POST:", error)
    // Return default markdown if there's an error
    return new Response(DEFAULT_MARKDOWN, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
  }
}

// Default markdown to use when API fails
const DEFAULT_MARKDOWN = `# Thông tin cá nhân
**Họ và tên:** Nguyễn Quốc Thắng  
**MSSV:** 22127385  

# Classification Encoding
Biến đổi dữ liệu thành dạng số để máy học hiểu.

## Các phương pháp mã hóa
### Integer Encoding
Mỗi lớp là một số nguyên.

### One-Hot Encoding
Mỗi lớp là một vector nhị phân.

### Embedding
Biểu diễn lớp bằng vector số thực (hay dùng trong NLP).

# Logistic Regression
## Binary Classification
Phân loại dữ liệu thành 2 nhóm.

### Hàm Sigmoid
Chuyển đổi giá trị thành xác suất.

### Likelihood & Log Likelihood
- Xác suất mô hình dự đoán đúng.
- Lấy log để dễ tính toán.

### Cập nhật trọng số
Dùng Gradient Descent để tối ưu mô hình.

# Evaluation
## ROC Curve & AUC
Đánh giá mô hình theo các ngưỡng khác nhau.
- **AUC ~1:** Mô hình tốt.
- **AUC ~0.5:** Mô hình đoán ngẫu nhiên.

## Loss function cho hồi quy
- **MSE:** Sai số bình phương trung bình.
- **MAE:** Sai số trung bình tuyệt đối.

# Multi-class Classification
## One-vs-All (OvA)
Dùng nhiều mô hình nhị phân, chọn lớp có xác suất cao nhất.

## One-vs-One (OvO)
So sánh từng cặp lớp, lớp nào có nhiều phiếu bầu nhất thì chọn.
- OvO công bằng hơn OvA nhưng tốn tài nguyên hơn.
`

