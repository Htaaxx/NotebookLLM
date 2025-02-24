from openai import OpenAI
from fastapi import FastAPI 
from nltk.tokenize import sent_tokenize
import tiktoken
from typing import List
from transformers import AutoTokenizer
import numpy as np
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
import tiktoken
from sklearn.metrics.pairwise import cosine_similarity


def find_api_key(file_path, header):
    with open(file_path, 'r') as file:
        # read a list of lines into data
        data = file.readlines()
        # now change the 2nd line, note that you have to add a newline
        for i in range(len(data)):
            if data[i].startswith(header):
                return data[i].split('=')[1].strip()
    return None
def count_tokens(text, model):
    """
    Count the number of tokens in a text using a SentenceTransformer model.
    
    """
    return len(model.tokenize(text))
def read_txt_file(file_path):
    with open(file_path, "r") as f:
        return f.read()

def write_chunks_to_file(text, file_path):
    with open(file_path, "w") as f:
        f.write(text)   
def preprocess_pdf_text(text):
    """
    Preprocesses the text extracted from a PDF file.
    """
    text = text.replace("\n", " ")
    text = text.replace("\t", " ")
    text = " ".join(text.split())
    return text
def combine_sentences(sentences, buffer_size=1):
    # Go through each sentence dict
    for i in range(len(sentences)):

        # Create a string that will hold the sentences which are joined
        combined_sentence = ''

        # Add sentences before the current one, based on the buffer size.
        for j in range(i - buffer_size, i):
            # Check if the index j is not negative (to avoid index out of range like on the first one)
            if j >= 0:
                # Add the sentence at index j to the combined_sentence string
                combined_sentence += sentences[j]['sentence'] + ' '

        # Add the current sentence
        combined_sentence += sentences[i]['sentence']

        # Add sentences after the current one, based on the buffer size
        for j in range(i + 1, i + 1 + buffer_size):
            # Check if the index j is within the range of the sentences list
            if j < len(sentences):
                # Add the sentence at index j to the combined_sentence string
                combined_sentence += ' ' + sentences[j]['sentence']

        # Then add the whole thing to your dict
        # Store the combined sentence in the current sentence dict
        sentences[i]['combined_sentence'] = combined_sentence

    return sentences
def calculate_cosine_distances(sentences):
    distances = []
    for i in range(len(sentences) - 1):
        embedding_current = sentences[i]['combined_sentence_embedding']
        embedding_next = sentences[i + 1]['combined_sentence_embedding']
        # Calculate cosine similarity
        similarity = cosine_similarity([embedding_current], [embedding_next])[0][0]
        distance = 1 - similarity
        distances.append(distance)
        sentences[i]['distance_to_next'] = distance
    return distances, sentences
def combine_chunks(chunks, predictions):
        combined_chunks = {}
        for i, chunk in enumerate(chunks):
            if predictions[i] not in combined_chunks:
                combined_chunks[predictions[i]] = chunk
            else:
                combined_chunks[predictions[i]] += ' ' + chunk
        return combined_chunks


app = FastAPI() # gọi constructor và gán vào biến app
@app.get("/") # giống flask, khai báo phương thức get và url
async def root(): # do dùng ASGI nên ở đây thêm async, nếu bên thứ 3 không hỗ trợ thì bỏ async đi
    return {"message": "Hello World"}

@app.post("/get_smaller_branches/")
async def get_smaller_branches(doc: str):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    chunks = sent_tokenize(doc)
    sentences = [preprocess_pdf_text(chunk) for chunk in chunks]
    sentences = [{'sentence': x, 'index' : i} for i, x in enumerate(sentences)]
    sentences = combine_sentences(sentences, buffer_size=10)
    embeddings = []
    for sentence in sentences:
        embedding = model.encode(sentence['combined_sentence'])
        embeddings.append(embedding)
    for i, sentence in enumerate(sentences):
        sentence['combined_sentence_embedding'] = embeddings[i]
    # get similarity to the next sentence
    distances, sentences = calculate_cosine_distances(sentences)
    breakpoint_percentile_threshold = 95
    breakpoint_distance_threshold = np.percentile(distances, breakpoint_percentile_threshold) 
    num_distances_above_theshold = len([x for x in distances if x > breakpoint_distance_threshold]) 
    indices_above_thresh = [i for i, x in enumerate(distances) if x > breakpoint_distance_threshold]
    start_index = 0
    chunks = []

    # Iterate through the breakpoints to slice the sentences
    for index in indices_above_thresh:
        # The end index is the current breakpoint
        end_index = index

        # Slice the sentence_dicts from the current start index to the end index
        group = sentences[start_index:end_index + 1]
        combined_text = ' '.join([d['sentence'] for d in group])
        chunks.append(combined_text)
        
        # Update the start index for the next group
        start_index = index + 1

    # The last group, if any sentences remain
    if start_index < len(sentences):
        combined_text = ' '.join([d['sentence'] for d in sentences[start_index:]])
        chunks.append(combined_text)

    # grouped_sentences now contains the chunked sentences
    # for i, chunk in enumerate(chunks):
    #     print (f"Chunk #{i}")
    #     print(chunk)
    #     print ("\n")
    embeddings = model.encode(chunks)
    num_clusters = int(input('enter number of clusters: '))
    kmeans_model = KMeans(n_clusters= num_clusters)
    # get fit_predict
    kmeans_predictions = kmeans_model.fit_predict(embeddings)
    # print(kmeans_predictions)
    combined_chunks = combine_chunks(chunks, kmeans_predictions)

    open_ai_key = find_api_key('.myapi', 'openai')
    client = OpenAI(api_key= open_ai_key)
    result = []
    for i in range(num_clusters):
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that help reformat text and so it could be understandable with a single header."},
                {
                    "role": "user",
                    "content": combined_chunks[i]
                }
            ]
        )
        result.append(completion.choices[0].message.content)
    return result
