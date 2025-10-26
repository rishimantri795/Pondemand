from flask import Flask, request, jsonify, make_response, send_from_directory, session
import subprocess
from flask_cors import CORS, cross_origin
import sys
import os
import boto3
from botocore.exceptions import ClientError

from tasks import add
from tasks import ondemandworker, ondemandworkerfromfile

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests
from flask_session import Session
import secrets
import re
import tempfile
import PyPDF2
from datetime import datetime, timedelta
import pytz

from ondemandfromfile import on_demand_from_file
from ondemand import on_demand

cred= os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')

app = firebase_admin.initialize_app(cred)

db = firestore.client()

sys.path.append(r'C:\Users\rishi\newsaggregator')

app = Flask(__name__)

# At the top of your file, after creating the Flask app
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "https://www.pondemand.ai", "https://pondemand.ai"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
    }
})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') 
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_COOKIE_NAME'] = 'my_session'  # Custom name for easier identification
app.config['SESSION_COOKIE_SECURE'] = False# for HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'

Session(app)

s3 = boto3.client('s3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
    region_name='us-east-2'
)
BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')

AUDIO_DIRECTORY = 'articles'


# Example Flask route to enqueue a task
@app.route('/start-task', methods=['POST'])
def start_task():
    text = "Department of Government Efficiency"
    user = "109729916907407366803"
    isNews = True
    activeTab = True
    file = "test"

    result = ondemandworker.delay(text, user, isNews, activeTab, file)
    print(result)

    return jsonify({"task_id": result.id}), 202

@app.route('/get_task_status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    result = ondemandworker.AsyncResult(task_id)
    return jsonify({"status": result.status}), 200

@app.route('/mark_as_listened/<id>', methods=['POST'])
def mark_as_listened(id):
    try:
        doc_ref = db.collection("articles").document(id)
        doc_ref.update({
            'listened': True
        })

        return jsonify({'message': 'Article marked as listened'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mark_as_unlistened/<id>', methods=['POST'])
def mark_as_unlistened(id):
    try:
        doc_ref = db.collection("articles").document(id)
        doc_ref.update({
            'listened': False
        })

        return jsonify({'message': 'Article marked as unlistened'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/add_audio_to_share', methods=['POST'])
def add_audio_to_share():
    try:
        data = request.get_json()
        audio_id = data.get('audioId')
        user_id = data.get('userId')

        print("audio_id:" + audio_id)
        print("user_id:" + user_id)

        user_ref = db.collection("users").document(user_id).collection('files').document(audio_id)
        doc = user_ref.get()
        doc_dict = doc.to_dict()


        #add audio to a collection named shared with every detail of the audio

        shared_ref = db.collection("shared").document(audio_id)
        shared_ref.set(doc_dict)
        

        return jsonify({'message': 'Audio added to shared list'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_audio_to_user', methods=['POST'])
def add_audio_to_user():
    try:
        data = request.get_json()
        audio_id = data.get('audioId')
        user_id = data.get('userId')

        doc_ref = db.collection("shared").document(audio_id)
        doc = doc_ref.get()
        doc_dict = doc.to_dict()

        user_ref = db.collection("users").document(user_id).collection('files').document(audio_id)
        user_ref.set(doc_dict)

        return jsonify({'message': 'Audio added to user list'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/get_audio_files', methods=['GET'])
def get_audio_files():
    try:
        audio_paths = []
        docs = db.collection("articles")

        query = docs.order_by('date',direction=firestore.Query.DESCENDING).limit_to_last(15)
        results = query.get()

        for doc in results:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            audio_paths.append(doc_dict)

        # audio_paths = [doc.to_dict() for doc in results]

        return jsonify(audio_paths)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_user_audio_file/<id>/<userId>', methods=['GET'])
def get_user_audio_file(id, userId):
    try:
        doc_ref = db.collection("users").document(userId).collection('files').document(id)

        doc = doc_ref.get()
        doc_dict = doc.to_dict()
        split_conversation = re.split(r"(\*\*[A-Za-z]+:\*\*)", doc_dict['transcript'])
        lines = [split_conversation[i] + split_conversation[i+1] for i in range(1, len(split_conversation) - 1, 2)]

        doc_dict['lines'] = lines
        return jsonify(doc_dict)

    except Exception as e:
        return jsonify({'error': str(e)}), 404
    

@app.route('/get_user_audio_files/<userId>', methods=['GET'])
def get_user_audio_files(userId):
    try:
        audio_paths = []
        docs = db.collection("users").document(userId).collection('files')

        query = docs.order_by('date',direction=firestore.Query.DESCENDING)

        results = query.get()
        for doc in results:
            doc_dict = doc.to_dict()
            doc_dict['id'] = doc.id
            audio_paths.append(doc_dict)

        # audio_paths = [doc.to_dict() for doc in results]

        return jsonify(audio_paths)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_audio_file/<filename>', methods=['GET'])
def get_audio_file(filename):
    try:
        doc_ref = db.collection("articles").document(filename)
        doc = doc_ref.get()
        doc_dict = doc.to_dict()
        split_conversation = re.split(r"(\*\*[A-Za-z]+:\*\*)", doc_dict['transcript'])
        lines = [split_conversation[i] + split_conversation[i+1] for i in range(1, len(split_conversation) - 1, 2)]

        doc_dict['lines'] = lines
        return doc_dict

    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/articles/<filename>', methods=['GET'])
def serve_audio_file(filename):
    return send_from_directory(AUDIO_DIRECTORY, filename)

@app.route('/custom/<filename>', methods=['GET'])
# @cross_origin(origins=["http://localhost:3000", "https://www.pondemand.app", "https://pondemand.app/byyou"])
# @cross_origin()
def serve_custom_audio_file(filename):
    try:
        url = s3.generate_presigned_url('get_object',
                                        Params={'Bucket': BUCKET_NAME,
                                                'Key': f'custom/{filename}'},
                                        ExpiresIn=3600)  # URL expires in 1 hour
        return jsonify({'url': url}), 200
    except ClientError as e:
        
        return jsonify({'error': str(e)}), 404

@app.route('/check_credits/<userId>', methods=['GET'])
def check_credits(userId):
    try:

        doc_ref = db.collection("users").document(userId)
        doc = doc_ref.get()

        if doc.exists:
            user_data = doc.to_dict()
            credits = user_data.get('credits', None)  # returns None if 'credits' doesn't exist


            if credits < 3:
                # Get the current time and subtract one day

                try:
                    last_refreshed_time = user_data.get('lastRefreshedTime', None)
                    if last_refreshed_time:
                        # Convert Firestore timestamp to UTC datetime
                        last_refreshed_time = last_refreshed_time.astimezone(pytz.UTC)
                    
                    yesterday = datetime.now(pytz.UTC) - timedelta(days=1)
                    
                    if (last_refreshed_time is None) or (last_refreshed_time < yesterday):
                        doc_ref.update({
                            'credits': 3,
                            'lastRefreshedTime': firestore.SERVER_TIMESTAMP
                        })
                        credits = 3
                except Exception as e:
                    print(f"Error: {e}")
                    return jsonify({'error': str(e)}), 500 
    


            print(f"User credits: {credits}")
        else:
            print("No such document!")
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'credits': credits}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add_todo', methods=['POST', 'OPTIONS'])
# @cross_origin(origins=["http://localhost:3000", "https://www.pondemand.app", "https://pondemand.app/byyou"])
def add_todo():
    if request.method == "OPTIONS":
        return {}
    elif request.method == "POST":
        try:

            if request.content_type and 'multipart/form-data' in request.content_type:
                    # Handle FormData
                topic = request.form.get('topic')
                user = request.form.get('userId')
                activeTab = request.form.get('activeTab')
                isNewsTopic = request.form.get('isNewsTopic')
                style = request.form.get('style')
                length = request.form.get('length')
                    
                    # Handle voice files
                voice1_type = request.form.get('voice1_type')
                voice2_type = request.form.get('voice2_type')
                    
                voice1_file = request.files.get('voice1_file') if voice1_type == 'custom' else None
                voice2_file = request.files.get('voice2_file') if voice2_type == 'custom' else None
                    
                voice1_name = request.form.get('voice1') if voice1_type == 'preset' else None
                voice2_name = request.form.get('voice2') if voice2_type == 'preset' else None
                    
            else:
                    # Handle JSON
                data = request.get_json()
                topic = data.get('topic')
                user = data.get('userId')
                activeTab = data.get('activeTab')
                isNewsTopic = data.get('isNewsTopic')
                style = data.get('style')
                length = data.get('length')
                    
                voice1_type = data.get('voice1_type')
                voice2_type = data.get('voice2_type')
                voice1_name = data.get('voice1')
                voice2_name = data.get('voice2')
                voice1_file = None
                voice2_file = None
        except Exception as e:
            return jsonify({'error': str(e)}), 400
        
        print(f"topic: {topic}, user: {user}, activeTab: {activeTab}, isNewsTopic: {isNewsTopic}, style: {style}, length: {length}")
        print(f"voice1_type: {voice1_type}, voice2_type: {voice2_type}, voice1_name: {voice1_name}, voice2_name: {voice2_name}")

        if topic:
            try:
                voice1_file_data = voice1_file.read() if voice1_file else None
                voice2_file_data = voice2_file.read() if voice2_file else None
                    

                result = ondemandworker.delay(topic, user, isNewsTopic, style, length, voice1_type, voice2_type, voice1_name, voice2_name, voice1_file_data, voice2_file_data)

                print(result)

                return jsonify({"task_id": result.id}), 202

                # return {'message': 'Todo added successfully'}

            except Exception as e:
                print(f"Error: {e}")
                error_dictionary = {'title': 'Error', 'text': 'Oops! An error occurred while processing your request.'}
                return error_dictionary
                #make doc with error message

        else:
            return jsonify({'error': 'No topic provided'}), 400
    else:
        raise RuntimeError("Weird - don't know how to handle method {}".format(request.method))


@app.route('/add_todo_file', methods=['POST', 'OPTIONS'])
# @cross_origin(supports_credentials=True)
# @cross_origin(origins=["http://localhost:3000", "https://www.pondemand.app", "https://pondemand.app/byyou"])
def add_todo_file():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method == "POST":
        try:
            if 'file' not in request.files:
                return jsonify({'error': 'No file part'}), 400
            file = request.files['file']

            instructions = request.form.get('instructionInput', '')
            user = request.form.get('userId', '')
            style = request.form.get('style', '')

            voice1_type = request.form.get('voice1_type')
            voice2_type = request.form.get('voice2_type')
            voice1_name = request.form.get('voice1')
            voice2_name = request.form.get('voice2')
            voice1_file = request.files.get('voice1_file') if voice1_type == 'custom' else None
            voice2_file = request.files.get('voice2_file') if voice2_type == 'custom' else None

            print(f"user: {user}, instructions: {instructions}, style: {style}")
            print(f"voice1_type: {voice1_type}, voice2_type: {voice2_type}, voice1_name: {voice1_name}, voice2_name: {voice2_name}")



            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400

            if not file.filename.endswith('.pdf'):
                return jsonify({'error': 'File must be a PDF'}), 400
            
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                file.save(tmp.name)
            
                text = extract_text_from_pdf(tmp.name)
            
            # Delete the temporary file
                os.unlink(tmp.name)

                try:
                    voice1_file_data = voice1_file.read() if voice1_file else None
                    voice2_file_data = voice2_file.read() if voice2_file else None

                    # response = make_response({"message": "Todo added successfully"})
                    # return _corsify_actual_response(response)

                    result = ondemandworkerfromfile.delay(text, user, instructions, style, voice1_type, voice2_type, voice1_name, voice2_name, voice1_file_data, voice2_file_data)
                    print(result)

                    return jsonify({"task_id": result.id}), 202


                except Exception as e:
                    print(f"Error: {e}")
                    error_dictionary = {'title': 'Error', 'text': 'Oops! An error occurred while processing your request.'}
                    return error_dictionary

        except Exception as e:
            return jsonify({'error': str(e)}), 400

        
                
def extract_text_from_pdf(file_path):
    text = ""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

    except Exception as e:
        return "error with extracting text from pdf: " + str(e)
    return text            

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_PROJECT_ID = os.environ.get("GOOGLE_PROJECT_ID")

client_config = {
    "web": {
        "client_id": GOOGLE_CLIENT_ID,
        "project_id": GOOGLE_PROJECT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uris": ["https://pondemand-b26dced7fb8b.herokuapp.com/googleauth"],
        "javascript_origins": ["http://localhost:3000", "https://www.pondemand.app", "https://www.pondemand.ai"]
    }
}
# OAuth 2.0 scopes
SCOPES = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile', 'openid']

@app.route('/googleauth', methods=['GET', 'POST'])
# @cross_origin(supports_credentials=True)
# @cross_origin(origins=["http://localhost:3000", "https://www.pondemand.app", "https://pondemand.app/byyou"])

def googleauth():

    # Get the authorization code from the request
    auth_code = request.json.get('code')

    if not auth_code:
        return jsonify({"error": "No authorization code provided"}), 400

    try:
        # Create a Flow instance to handle the OAuth 2.0 Authorization Grant Flow steps.
        flow = Flow.from_client_config(
            client_config = client_config,
            scopes=SCOPES,
            redirect_uri="postmessage"
        )

        # Exchange the authorization code for user credentials
        flow.fetch_token(code=auth_code)

        # Get the ID Token
        credentials = flow.credentials
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, requests.Request(), GOOGLE_CLIENT_ID)

        # Extract user information
        user_id = id_info['sub']
        email = id_info['email']
        name = id_info.get('name', '')
        # picture = id_info.get('picture', '')

        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()

        if user_doc.exists:
            # User exists, update last login
            user_ref.update({
                'last_login': firestore.SERVER_TIMESTAMP,
                'email': email,
            })
        else:
            # User doesn't exist, create new user
            user_ref.set({
                'email': email,
                'name': name,
                'created_at': firestore.SERVER_TIMESTAMP,
                'last_login': firestore.SERVER_TIMESTAMP,
                'lastRefreshedTime': firestore.SERVER_TIMESTAMP,
                'credits': 3
            })
            

        session_token = secrets.token_urlsafe(32)
        print(session_token)
        
        new_user_ref = db.collection('tokens').document(session_token)
        new_user_doc = new_user_ref.get()

        if new_user_doc.exists:
            # User exists, update last login
            new_user_ref.update({
                'expiration': firestore.SERVER_TIMESTAMP,       
                'email': email
            })
        else:
            # User doesn't exist, create new user
            new_user_ref.set({
                'expiration': firestore.SERVER_TIMESTAMP,
                'userid': user_id,
                'name': name,
                'email': email,
            })

        

        return jsonify({
            "message": "Authentication successful",
            "user": {
                "id": user_id,
                "email": email,
                "name": name,
                
                # "picture": picture
            },
            "session_token": session_token
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route('/check_session', methods=['GET'])
def check_session():
    
    token = request.headers.get('Authorization')  # Assuming token is passed in headers

    if not token:
         print("No token provided")
         return jsonify({"message": "No token provided"}), 401

    docs = (db.collection("tokens").stream())
    values = [doc.id for doc in docs]

    if token in values:
        ref=db.collection("tokens").document(token)
        doc = ref.get()
        user = doc.get("userid")
        name = doc.get("name")
        email = doc.get("email")
        return jsonify({"message": "User is authenticated","userid":user, "name":name, "email":email}), 200
    else:
        return jsonify({"message": "Unauthorized"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    try:
        token = request.headers.get('Authorization')
        print(f"token to delete: {token}")
        db.collection("tokens").document(token).delete()

        return jsonify({"message": "Successfully logged out"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


def _build_cors_preflight_response():
    # response = make_response()
    # response.headers.add("Access-Control-Allow-Origin", "*")
    # response.headers.add('Access-Control-Allow-Headers', "*")
    # response.headers.add('Access-Control-Allow-Methods', "*")

    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")  # Allow any origin or use specific origins
    response.headers.add('Access-Control-Allow-Headers', "Content-Type")
    response.headers.add('Access-Control-Allow-Methods', "POST, OPTIONS")
    
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")

    return response

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    # app.run(debug=True, port=5001)

