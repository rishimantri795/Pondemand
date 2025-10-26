from celery import Celery
from ondemand import on_demand

import firebase_admin
from firebase_admin import credentials, initialize_app, firestore

from ondemandfromfile import on_demand_from_file
from getvoiceids import retrieve_voice_ids, delete_voice

broker = os.environ.get('REDIS_BROKER_URL')
backend = os.environ.get('REDIS_BACKEND_URL')
app = Celery('tasks', broker=broker, backend=backend)

firebase_app = None

# Function to get (or initialize) the Firebase app
def get_firebase_app():
    global firebase_app
    if not firebase_app:
        cred = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
        firebase_app = firebase_admin.initialize_app(cred)
    return firebase_app

@app.task
def add(x, y):
    print("x: ", x)
    print("y: ", y) 
    print("x + y: ", x + y)
    return x + y

@app.task
def ondemandworker(text, user, isNews, style, length, voice1_type, voice2_type, voice1_name, voice2_name, voice1_file, voice2_file):
    firebase_app = get_firebase_app()
    db = firestore.client(firebase_app)

    voice1_id, voice2_id = retrieve_voice_ids(voice1_type, voice2_type, voice1_file, voice2_file, voice1_name, voice2_name)
    print("voice1_id: ", voice1_id)
    print("voice2_id: ", voice2_id)

    val = on_demand(text, user, isNews, db, style, length, voice1_name, voice2_name, voice1_id, voice2_id)

    if voice1_type == 'custom':
        delete_voice(voice1_id)
    if voice2_type == 'custom':
        delete_voice(voice2_id)
    

    # val = on_demand(text, user, isNews, activeTab, file, db, style, length, voice1_type, voice2_type, voice1_name, voice2_name, voice1_file, voice2_file)
    return val

@app.task
def ondemandworkerfromfile(text, user, instructions, style, voice1_type, voice2_type, voice1_name, voice2_name, voice1_file, voice2_file):
    firebase_app = get_firebase_app()
    db = firestore.client(firebase_app)
    voice1_id, voice2_id = retrieve_voice_ids(voice1_type, voice2_type, voice1_file, voice2_file, voice1_name, voice2_name)
    val = on_demand_from_file(text, user, db, instructions, style, voice1_name, voice2_name, voice1_id, voice2_id)

    if voice1_type == 'custom':
        delete_voice(voice1_id)
    if voice2_type == 'custom':
        delete_voice(voice2_id)
        
    return val