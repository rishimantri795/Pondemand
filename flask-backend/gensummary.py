import google.generativeai as genai
import os

def generate_summary(transcript):
    
    google_key = os.environ['GEMINI_API_KEY']

    genai.configure(api_key=google_key)

    model = genai.GenerativeModel('gemini-1.5-flash')

    response = model.generate_content('For the following podcast transcript given to you, generate a 2-3 line summary of the information within it: ' + transcript)
    
    return(response.text)    


