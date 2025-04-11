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

    const num_clusters = 5
    const url = API_URL + `/embed/get_smaller_branches_from_docs?num_clusters=${num_clusters}`
    const user_id = body.user_id ;

    console.log("Received request body:", body.document_ids);
    console.log("Using user_id:", user_id);

    const requestBody = {
      user_id: String(user_id), 
      documentIDs: body.document_ids
    };

    // Make the request to the backend API with properly formatted JSON
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept-Charset": "UTF-8", 
      },
      // Send just the array of document IDs
      body: JSON.stringify(requestBody),
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
const DEFAULT_MARKDOWN = `
# Machine Learning - Classification Encoding
- Biến đổi dữ liệu thành dạng số để máy học hiểu. Việc này rất quan trọng vì phần lớn các mô hình học máy chỉ làm việc với dữ liệu dạng số. Nếu không mã hóa đúng, mô hình có thể hiểu sai bản chất của dữ liệu.

## Các phương pháp mã hóa

### Integer Encoding

- Mỗi lớp là một số nguyên. Ví dụ: "Red" → 0, "Green" → 1, "Blue" → 2. Cách này đơn giản và nhanh nhưng có thể gây hiểu nhầm là các lớp có thứ tự.

- Ghi chú: Dễ gây sai lệch nếu dùng với mô hình như Linear Regression vì nó nghĩ 2 > 1 > 0 là có ý nghĩa về khoảng cách.

### One-Hot Encoding

- Mỗi lớp là một vector nhị phân. Ví dụ: "Red" → [1, 0, 0], "Green" → [0, 1, 0], "Blue" → [0, 0, 1].

- Ghi chú: Không tạo ra mối quan hệ giả giữa các lớp như Integer Encoding nhưng có thể làm tăng số chiều dữ liệu rất nhiều.

### Embedding

- Biểu diễn lớp bằng vector số thực (hay dùng trong NLP). Các vector được học trong quá trình huấn luyện.

- Ghi chú: Giữ lại được thông tin ngữ nghĩa giữa các lớp (vd: "king" gần "queen" hơn "dog"), phù hợp với dữ liệu dạng văn bản.

# Logistic Regression

## Binary Classification

- Phân loại dữ liệu thành 2 nhóm. Ví dụ: Email là spam (1) hoặc không spam (0). Đây là một trong những bài toán phổ biến nhất.

- Ghi chú: Mô hình Logistic Regression trả về xác suất thay vì nhãn trực tiếp.

### Hàm Sigmoid

Chuyển đổi giá trị thành xác suất = sigma() thuộc (0,1)

### Likelihood & Log Likelihood

- Xác suất mô hình dự đoán đúng.
- Lấy log để dễ tính toán.
- Ghi chú: Log likelihood thường được tối đa hóa trong quá trình huấn luyện để tìm bộ trọng số tốt nhất.

### Cập nhật trọng số

- Dùng Gradient Descent để tối ưu mô hình.
- Ghi chú: Với mỗi bước học, trọng số được điều chỉnh để giảm sai số dự đoán.

# Evaluation

## ROC Curve & AUC

Đánh giá mô hình theo các ngưỡng khác nhau. ROC vẽ đường cong giữa TPR và FPR.

- AUC ~1: Mô hình tốt.
- AUC ~0.5: Mô hình đoán ngẫu nhiên.
- Ghi chú: ROC hữu ích khi dữ liệu mất cân bằng (nhiều 0 ít 1 hoặc ngược lại).

## Loss function cho hồi quy

- MSE: Sai số bình phương trung bình.
- MAE: Sai số trung bình tuyệt đối.

- MSE nhạy cảm với giá trị ngoại lai vì nó bình phương sai số.
- MAE phản ánh sai số thực tế tốt hơn khi có outlier.

# Multi-class Classification

## One-vs-All (OvA)

- Dùng nhiều mô hình nhị phân, chọn lớp có xác suất cao nhất.
- Ghi chú: Với n lớp, cần huấn luyện n mô hình. Đơn giản nhưng có thể không công bằng nếu một lớp luôn bị các lớp khác "lấn át".

## One-vs-One (OvO)

- So sánh từng cặp lớp, lớp nào có nhiều phiếu bầu nhất thì chọn.

- OvO công bằng hơn OvA nhưng tốn tài nguyên hơn.

- Ghi chú: Với n lớp cần huấn luyện (n-1)n/2 mô hình → rất nhiều khi n lớn. Tuy nhiên mô hình thường chính xác hơn.

`

