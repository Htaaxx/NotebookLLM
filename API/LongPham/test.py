# Use a pipeline as a high-level helper
from transformers import pipeline

messages = [
    {"role": "user", "content": "Who are you?"},
]
pipe = pipeline(
    "image-text-to-text", model="5CD-AI/Vintern-1B-v3_5", trust_remote_code=True
)
pipe(messages)
