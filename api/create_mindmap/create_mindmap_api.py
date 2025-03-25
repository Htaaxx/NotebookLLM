from openai import OpenAI
from fastapi import FastAPI 
from nltk.tokenize import sent_tokenize
import numpy as np
from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import os
from typing import List
def find_api_key(file_path, header):
    with open(file_path, 'r') as file:
        data = file.readlines()

        for i in range(len(data)):
            if data[i].startswith(header):
                return data[i].split('=')[1].strip()
    return None


def count_tokens(text, model):
    return len(model.tokenize(text))


def read_txt_file(file_path):
    with open(file_path, "r") as f:
        return f.read()


def write_chunks_to_file(text, file_path):
    with open(file_path, "w") as f:
        f.write(text)   
        

def preprocess_pdf_text(text):
    text = text.replace("\n", " ")
    text = text.replace("\t", " ")
    text = " ".join(text.split())
    return text


def combine_sentences(sentences, buffer_size=1):
    for i in range(len(sentences)):
        combined_sentence = ''
        for j in range(i - buffer_size, i):
            if j >= 0:
                combined_sentence += sentences[j]['sentence'] + ' '
        combined_sentence += sentences[i]['sentence']
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



def get_smaller_branches_from_docs(docs: List[str], num_clusters: int):
    model = SentenceTransformer('all-MiniLM-L6-v2')
    all_chunks = []
    for doc in docs:
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
        indices_above_thresh = [i for i, x in enumerate(distances) if x > breakpoint_distance_threshold]
        start_index = 0
        chunks = []

        # Iterate through the breakpoints to slice the sentences
        for index in indices_above_thresh:
            end_index = index
            group = sentences[start_index:end_index + 1]
            combined_text = ' '.join([d['sentence'] for d in group])
            chunks.append(combined_text)
            start_index = index + 1

        # The last group, if any sentences remain
        if start_index < len(sentences):
            combined_text = ' '.join([d['sentence'] for d in sentences[start_index:]])
            chunks.append(combined_text)
        all_chunks.extend(chunks)

    
    embeddings = model.encode(all_chunks)
    kmeans_model = KMeans(n_clusters= num_clusters)
    kmeans_predictions = kmeans_model.fit_predict(embeddings)
    combined_chunks = combine_chunks(all_chunks, kmeans_predictions)

    open_ai_key = os.getenv('OPENAI_API_KEY_MINDMAP')
    client = OpenAI(api_key= open_ai_key)
    result = []
    for i in range(num_clusters):
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that help reformat text and so it could be understandable ."},
                {
                    "role": "user",
                    "content": combined_chunks[i]
                }
            ]
        )
        result.append(completion.choices[0].message.content)
    return result
async def get_smaller_branches_from_branch(doc: str):
    '''
    format doc to markdown and split them by headers
    '''
    pass
def read_txt_file(file_path):
    result = ""
    with open(file_path, "r") as f:
        result = f.read()
    return result
def write_txt_file(file_path, text):
    with open(file_path, "w") as f:
        f.write(text)
doc1 = read_txt_file("doc1.txt")
doc2 = read_txt_file("doc2.txt")
print(doc1 )
print(doc2)
branches = get_smaller_branches_from_docs([doc1, doc2], 5)
for i in range(len(branches)):
    write_txt_file(f"branch_{i}.txt", branches[i])