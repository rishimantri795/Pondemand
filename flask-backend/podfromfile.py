import google.generativeai as genai
import os
import re  


def pod_from_file(text, instructions='Explain all the topics in the PDF', style='Casual'):
    google_key = os.environ['GEMINI_API_KEY']
    genai.configure(api_key=google_key)

    model = genai.GenerativeModel('gemini-1.5-flash')

    form = ""

    if style == 'Casual':
        form = "It should sound like listening to two friends chatting authentically.  One host should be curious and easygoing, the other should be energetic and relatable."

    elif style == 'Interview':
        form = "It should sound like listening to an interview with a host and an expert. The host should be professional and inquisitive, the guest should be knowledgeable about the topic and engaging."

    elif style == 'Debate':
        form = "It should sound like listening to spirited debate between two hosts with opposing viewpoints on the topic. They should challenge each other's ideas, push back, and provide evidence to support their arguments."
    
    else:
        form = "It should sound like listening to a well-researched and authentic conversation between two hosts."

    
    response = model.generate_content('For the following PDF text given to you, generate a podcast conversation between two people, Jason and Jennifer. Here are the explicit user instructions to address when creating the conversation: ' + instructions + 'Make sure to revolve the conversation around the instructions. It should sound be an informative conversation, grounded in the text for someone who wants to learn or be entertained.' + form + ' Start the podcast by giving some context about the broader topic. Do not include unneccesary commentary which isnt informative or entertaining. It should be adequately long to cover the all of the important details and facts about the text. Include humor, question and answers from either side. Indicate changes in speaker with this sequence: **name:**. Do not include outros or intros with a podcast title or things like (laughs): ' + text)

    final_text = re.sub(r'\*\*(\w+):\*\*', r'\1:', response.text)

    return(final_text)    

