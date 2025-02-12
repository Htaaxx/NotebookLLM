# NotebookLLM

Welcome to **NotebookLLM**, a machine learning project developed by the **Notebook Team** as part of the 'Machine Learning' course. This repository contains the complete source code, including APIs, front-end, and back-end components.

## Team Members

| **Name**             | **Major**                                            | **University**                 |
| -------------------- | ---------------------------------------------------- | ------------------------------ |
| Tuan-Anh Ha          | Information Technology - Data Science                | University of Science (VNUHCM) |
| Quang-Thang Duong    | Information Technology - Computer Vision             | University of Science (VNUHCM) |
| Quoc-Thang Nguyen    | Information Technology - Computer Vision             | University of Science (VNUHCM) |
| Hai-Long Pham-Nguyen | Information Technology - Computer Vision             | University of Science (VNUHCM) |
| Thanh-Nghia Vo       | Information Technology - Natural Language Processing | University of Science (VNUHCM) |

## Project Structure

The project is divided into three main components: **API**, **Front-end**, and **Back-end**.

### API Structure

To use the API, follow these steps:
1. Create a virtual environment:
   ```sh
   python -m venv venv
   ```
2. Install dependencies from `requirements.txt`:
   ```sh
   pip install -r requirements.txt
   ```

> **Note:** This project uses `torch==2.6.0+cpu`. If you have an NVIDIA GPU, install the appropriate CUDA version of PyTorch for better performance.

#### API Directory Structure:
```
API/
├── extract_file_content_api/
|   ├── extract_file_content_api.py
├── get_youtube_transcript_api/
|   ├── get_youtube_transcript_api.py
├── requirements.txt
```

### Front-End Structure

The front-end is built with **Next.js** and manages the user interface and interactions.

#### Front-End Directory Structure:
```
frontend/
├── public/
├── src/
├── package.json  # Front-end dependencies and scripts
├── .env          # Front-end environment variables
└── README.md     # Front-end documentation
```

### Back-End Structure

The back-end is built with **Express.js**, handling server-side logic, API endpoints, database operations, and authentication.

#### Back-End Directory Structure:
```
backend/
├── src/
├── package.json  # Back-end dependencies and scripts
├── .env          # Back-end environment variables
└── README.md     # Back-end documentation
```

---
