import google.generativeai as genai
import os
import re  

def gemini_test(text, isNews, context, style, length=750):
    google_key = os.environ['GEMINI_API_KEY']
    genai.configure(api_key=google_key)

    model = genai.GenerativeModel('gemini-2.0-flash')

    form = ""
    if style == 'Casual':
        form = ("It should sound like listening to two friends chatting authentically. "
                "One host should be curious and easygoing, the other should be energetic and relatable.")
    elif style == 'Interview':
        form = ("It should sound like listening to an interview with a host and an expert. "
                "The host should be professional and inquisitive, the guest should be knowledgeable about the topic and engaging.")
    elif style == 'Debate':
        form = ("It should sound like listening to spirited debate between two hosts with opposing viewpoints on the topic. "
                "They should challenge each other's ideas, push back, and provide evidence to support their arguments.")
    else:
        form = ("It should sound like listening to a well-researched and authentic conversation between two hosts.")

    wordcount = ("The entire transcript for the podcast should be " + str(length) + " words in length. "
                 "Make sure to abide by this given word count.")
    

    if text.startswith('https://') or text.startswith('http://'):
        response = model.generate_content(
            wordcount +
            'For the following news article given to you, generate a podcast conversation between two people, Jason and Jennifer. '
            'Here is the context of the article: ' + context +
            '. Make the podcast revolve around this context and include additional information as requested by the article.' +
            form +
            'The context should only inform the points in the conversation, but not be the topic of conversation itself. '
            'Include humor, question and answers from either side. Indicate changes in speaker with this sequence: **name:**. '
            'Do NOT include introductions with a podcast title like "Tech Forward" or placeholders like (laughs).'
        )
    else:
        if isNews:
            response = model.generate_content(
                wordcount +
                'For the following news topic, create a podcast conversation between two people, Jason and Jennifer: ' + text +
                '. Here is news and current event context about the story: ' + context +
                'Start the podcast by giving some context about the broader topic. Then, move into the details of the news story, including any relevant facts or information.' +
                form +
                'The context should inform the points in the conversation, but additional information should be included as needed. '
                'Include humor, question and answers from either side. Indicate changes in speaker with this sequence: **name:**. '
                'Do NOT include introductions with a podcast title like "Tech Forward" or placeholders like (laughs).'
            )
        else:
            print(wordcount + 'For the following topic given to you, generate a podcast conversation between two people, Jason and Jennifer:' + text +
                  '. Here is some related context and facts to help with the conversation:' + context +
                  'Start the podcast by giving some context about the broader topic. Then, move into the details of the topic, including any relevant facts or information.' +
                  form +
                  'The context should inform the points in the conversation, but additional information should be included as needed. '
                  'Include humor, question and answers from either side. Indicate changes in speaker with this sequence: **name:**. '
                  'Do NOT include introductions with a podcast title like "Tech Forward" or placeholders like (laughs).'
            )
            

            response = model.generate_content(
                wordcount +
                'For the following topic given to you, generate a podcast conversation between two people, Jason and Jennifer:' + text +
                '. Here is some related context and facts to help with the conversation:' + context +
                'Start the podcast by giving some context about the broader topic. Then, move into the details of the topic, including any relevant facts or information.' +
                form +
                'The context should inform the points in the conversation, but additional information should be included as needed. '
                'Include humor, question and answers from either side. Indicate changes in speaker with this sequence: **name:**. '
                'Do NOT include introductions with a podcast title like "Tech Forward" or placeholders like (laughs).'
            )

    final_text = re.sub(r'\*\*(\w+):\*\*', r'\1:', response.text)
    return final_text