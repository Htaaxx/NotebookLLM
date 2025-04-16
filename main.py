from langchain.chains import create_citation_fuzzy_match_runnable
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2, openai_api_key=OPENAI_API_KEY)

context = "Alice has blue eyes. Bob has brown eyes. Charlie has green eyes."
question = "What color are Bob's eyes?"

chain = create_citation_fuzzy_match_runnable(llm)
result = chain.invoke({"question": question, "context": context})
print(result)
