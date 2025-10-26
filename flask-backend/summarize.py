import openai
import bs4 as bs
import pandas as pd
import requests
import trafilatura
import geminitest 
from gensummary import generate_summary
from audio import generate_audio
import datetime

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


def summarize():
    cred = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
    app = firebase_admin.initialize_app(cred)

    db = firestore.client()

    output_csv = pd.DataFrame(columns=['Title', 'Transcript', 'Path'])

    num = 0

    articles = pd.read_csv('articles2.csv')
    j = 0
    for row in articles.iterrows():
        j += 1
        link = row[1][2]
        if (row[1][3] == 'Wired') or (row[1][3] == 'TechCrunch'):

        #print(link)
            num += 1
            source = trafilatura.fetch_url(link)
            result = trafilatura.extract(source)

            try:
                transcript = geminitest.gemini_test(result)
                summary = generate_summary(result)
            except:
                transcript = 'error'  
            print(transcript)
            
            current_datetime = datetime.datetime.now()
            timestamp = int(current_datetime.strftime("%Y%m%d%H%M%S"))

            generate_audio(transcript, timestamp, False)

            output_csv = output_csv._append({'Title': row[1][1], 'Transcript': transcript, 'Path': f'articles/article{j}.mp3'}, ignore_index=True)

            doc_ref = db.collection("articles").document(f"article{j}")
            doc_ref.set({
                "title": row[1][1],
                "transcript": transcript,
                "path": f'articles/article{j}.mp3',
                "source": row[1][2],
                "custom": "false",
                "date" : firestore.SERVER_TIMESTAMP,
                "summary": summary
            })

            row[1][4] = transcript   
            
            if num == 3:
                break

    output_csv.to_csv('output_csv.csv', index=False)
        
if __name__ == '__main__':
    summarize()
