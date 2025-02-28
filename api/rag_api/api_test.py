import requests

files = [("files", open("document1.pdf", "rb")), ("files", open("document2.pdf", "rb"))]

response = requests.post("http://localhost:8000/embed", files=files)
print(response.json())
