import requests
from pydub import AudioSegment
import csv
import pandas as pd
import os
from io import BytesIO
import boto3
from werkzeug.utils import secure_filename
import tempfile

def generate_audio(text, num, custom, voice1_name, voice2_name, voice1_id, voice2_id, from_file):

    lines = text.split("\n")
    
    for i in range(len(lines)):
        # Technically not needed
        lines[i] = lines[i].replace("**", "")
        
        lines[i] = lines[i].strip()
        
        if lines[i].startswith("Jason:"):
            lines[i] = lines[i].split(":", 1)[1].strip()
        
        elif lines[i].startswith("Jennifer:"):
            lines[i] = lines[i].split(":", 1)[1].strip()
    
    lines = [line for line in lines if line.strip()]
    
    print(lines)

    files = []
    j = 1

    # Hard-coded edge case
    with tempfile.TemporaryDirectory() as temp_dir:
        for i in range(len(lines)):
            CHUNK_SIZE = 1024
            
            if j % 2 == 1:
                
                url = "https://api.elevenlabs.io/v1/text-to-speech/" + voice1_id
            else:
                
                url = "https://api.elevenlabs.io/v1/text-to-speech/" + voice2_id
            
            j = j + 1

            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": os.environ['ELEVEN_API_KEY']
            }

            data = {
                "text": lines[i],
                "model_id": "eleven_flash_v2_5",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.5
                }
            }

            try:
                response = requests.post(url, json=data, headers=headers)
                print("data: ", data)
                print("headers: ", headers)
                print("url: ", url)
                print("response: ", response)

                if response.status_code != 200:
                    print("Error generating audio: ", response.text)
                    
                
                temp_file_path = os.path.join(temp_dir, f'output{i}.mp3')

                # Write the audio content to a temp file
                with open(temp_file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                        if chunk:
                            f.write(chunk)

                # Keep track of all temp MP3 segments
                files.append(temp_file_path)
            
            except Exception as e:
                print("error with audio: ", e)

        if custom:
            base_path = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(base_path, f'custom/custom_article{num}.mp3')
            length = combine_mp3(files, file_path, True)
            return f"custom_article{num}.mp3", length
        else:
            base_path = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(base_path, f'articles/article{num}.mp3')
            length = combine_mp3(files, file_path, False)
            return f"/articles/article{num}.mp3", length

def combine_mp3(files, output_file, custom):
    totalLength = 0
    combined = AudioSegment.empty()
    
    for file in files:
        if custom:
            sound = AudioSegment.from_mp3(file)
        else:
            sound = AudioSegment.from_mp3(file)

        combined += sound
        totalLength += len(sound)
    
    # Use an in-memory buffer for combined audio
    buffer = BytesIO()
    combined.export(buffer, format="mp3")
    buffer.seek(0)

    s3 = boto3.client(
        's3',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        region_name='us-east-2'
    )

    filename = output_file.split('/')[-1]
    filename = secure_filename(filename)
    filename = 'custom/' + filename
    s3.upload_fileobj(buffer, os.environ['S3_BUCKET_NAME'], filename)

    return ((totalLength / 1000) // 60)




