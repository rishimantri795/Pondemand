import google.generativeai as genai
import os

def generate_title(text):
    
    google_key = os.getenv('GEMINI_API_KEY')

    genai.configure(api_key=google_key)

    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content('For the following podcast transcript given to you, create a title/head line for the information within it. Just give me the headline, without any other words: ' + text)
    
    return(response.text)    


