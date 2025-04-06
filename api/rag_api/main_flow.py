"""
SET UP ENVIRONMENT VARIABLES
"""

import os
from dotenv import load_dotenv

from langchain_milvus import Zilliz
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_openai import ChatOpenAI

from tqdm import tqdm


# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ZILLIZ_CLOUD_URI = os.getenv("ZILLIZ_CLOUD_URI")
ZILLIZ_CLOUD_TOKEN = os.getenv("ZILLIZ_CLOUD_TOKEN")

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={"device": "cpu"},
    encode_kwargs={
        " normalize_embeddings": True,
        "batch_size": 32,
    },
)

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.2,
    openai_api_key=OPENAI_API_KEY,
)

vector_store = Zilliz(
    embedding_function=embeddings,
    connection_args={
        "uri": ZILLIZ_CLOUD_URI,
        "token": ZILLIZ_CLOUD_TOKEN,
    },
    collection_name="rag_collection",
    auto_id=True,
)

"""
BUILD RAG CHATBOT
"""

import bs4
from langchain import hub
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import START, StateGraph
from typing_extensions import List, TypedDict

# Load and chunk contents of the blog
loader = WebBaseLoader(
    web_paths=("https://milvus.io/docs/overview.md",),
    bs_kwargs=dict(parse_only=bs4.SoupStrainer(class_=("doc-style doc-post-content"))),
)

docs = loader.load()
total_chars = sum(len(doc.page_content) for doc in docs)
print(f"Total characters in all documents: {total_chars}")


text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
all_splits = text_splitter.split_documents(docs)

"""
Add documents with ids to the vector store [Later Fix]
"""

batch_size = 16
for i in tqdm(range(0, len(all_splits), batch_size), desc="Embedding documents"):
    batch = all_splits[i : i + batch_size]
    _ = vector_store.add_documents(documents=batch)


# Define prompt for question-answering
prompt = hub.pull("rlm/rag-prompt")


# Define state for application
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str


# Define application steps
def retrieve(state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}


def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}


# Compile application and test
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()

response = graph.invoke({"question": "What data types does Milvus support?"})


print("LLM Response:")
print(response["answer"])
