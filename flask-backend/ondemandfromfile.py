import datetime
import os
from gensummary import generate_summary
from gentitle import generate_title
from openaitts import generate_audio3
from audio import generate_audio
from podfromfile import pod_from_file
from firebase_admin import firestore


def on_demand_from_file(text, user, db , instructions,style, voice1_name, voice2_name, voice1_id, voice2_id):

    current_datetime = datetime.datetime.now()
    current_int = int(current_datetime.strftime("%Y%m%d%H%M%S"))
    #current_int = 69

    try:
        transcript = pod_from_file(text, instructions, style)
    except Exception as e:
        print("error with llm: ", e)
        transcript = 'error'

    try:
        audio_file_path, length = generate_audio(transcript, current_int, True, voice1_name, voice2_name, voice1_id, voice2_id, True)
        summary = generate_summary(transcript)
        title = generate_title(transcript)
    except Exception as e:
        print("error with audio outside: ", e)
        audio_file_path = 'error'       #add audio file with some error message 


    doc_ref = db.collection("users").document(user).collection("files").document(f"article{current_int}")
    
    write1 = doc_ref.set({
        "title": title,
        "transcript": transcript,
        "path": f'custom/custom_article{current_int}.mp3',
        "source": "notNews",
        "custom": "true",
        "date": firestore.SERVER_TIMESTAMP,
        "summary": summary,
        "length": length
    })

    user_ref = db.collection("users").document(user)
    write2 = user_ref.update({
        'credits': firestore.Increment(-1)
    })

    unique_id = f"article{current_int}"

    return unique_id