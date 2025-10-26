from bs4 import BeautifulSoup
import requests
import trafilatura
import newspaper
from newspaper import Article
from geminitest import gemini_test
import audio
from audio import generate_audio
from pollytest import generate_audio2
from openaitts import generate_audio3  
import sys  
import datetime
import google.generativeai as genai
from gensummary import generate_summary
from gentitle import generate_title
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from gettingarticles import get_final_url
import boto3
from werkzeug.utils import secure_filename
from sonartest import sonar_test
import os

def on_demand(text, user, isNews, db, style, length, voice1_name, voice2_name, voice1_id, voice2_id):

    if text == "test":
       db = firestore.client()

       doc_ref = db.collection("articles").document("article20240624193525")
       doc_ref.set({
            "title": "Anthropic's new model, Claude 3.5 Sonnet.",
            "transcript": """**Rishi:** Hey Pradhan, you excited for the weekend? I know I am. It's been a wild week in the AI world, and I need a break. 

**Pradhan:** You know it, Rishi. I'm planning to unplug and enjoy some much-needed peace and quiet. But before we do, we have to talk about Anthropic's new model, Claude 3.5 Sonnet. It's been making waves.

**Rishi:** You're right, it's pretty big news.  For those who are not in the know, Anthropic is essentially OpenAI's biggest rival right now. They're both developing cutting-edge generative AI models, but Anthropic tries to distinguish itself as the more "ethical" and "responsible" player.  

**Pradhan:**  So, basically, they're trying to make sure their AI doesn't become Skynet? 

**Rishi:**  Not quite that dramatic, but you get the gist. They're putting a lot of focus on safety protocols and mitigating potential risks.  

**Pradhan:**  So, what's so special about this new Claude 3.5 Sonnet model? 

**Rishi:** Well, it's not just a minor upgrade.  Anthropic claims it surpasses even their previous top-tier model, Claude 3 Opus, in several key areas.  

**Pradhan:**  Wow, that's a big statement. What kind of areas are we talking about? 

**Rishi:**  Well, it's supposed to be smarter, faster, and even has some vision capabilities.  It's essentially a jack of all trades.

**Pradhan:**   Vision capabilities? That's interesting.  Can it understand images like GPT-4o?

**Rishi:**  That's right! It can interpret charts, graphs, transcribe text from images, and generally understand visuals.  They even have a demo showing Claude 3.5 Sonnet creating a slideshow presentation for a genomics class!

**Pradhan:**  Okay, that's pretty impressive.  But does it generate images like OpenAI's DALL-E 3?

**Rishi:**  No, not yet. Anthropic is a bit more cautious when it comes to image generation, which makes sense considering the potential for misuse of that technology.

**Pradhan:**  That's interesting.  It seems like Anthropic is taking a more conservative approach overall, putting safety and ethics first.

**Rishi:**  Exactly.  They're even working with organizations like the UK's AI Safety Institute and Thorn, a child safety organization, to test and refine the model's safety mechanisms.

**Pradhan:**  So, while it might not be as flashy as DALL-E, this model is still pretty impressive. How does it stack up against GPT-4o in terms of performance?

**Rishi:**  According to Anthropic's benchmarks, Claude 3.5 Sonnet outperforms GPT-4o in several areas, like reasoning, coding, and even graduate-level knowledge. It also seems to be significantly faster.

**Pradhan:**  Hold on, faster? We're talking about AI models here, they're already pretty fast. What does that mean for the average user?

**Rishi:**  Well, for everyday tasks, it might not be a noticeable difference. But for developers and businesses using these models for complex tasks, the speed advantage could be huge.

**Pradhan:**  I see.  So, it's like a faster, more intelligent, and slightly more ethical GPT-4o?

**Rishi:**  That's a good way to put it.  Though some AI experts argue that these benchmarks, while impressive, might not be the best indicator of a model's true capabilities.

**Pradhan:**  Why is that?

**Rishi:**  Because they're often very narrow in focus and might not reflect how people actually interact with these models in real-world scenarios.        

**Pradhan:**  Makes sense. So, what are some of the other key features of Claude 3.5 Sonnet?

**Rishi:**  One of the most interesting things is a new feature called "Artifacts." It essentially creates a workspace where you can see and interact with the output of the AI in real-time. So, if you ask Claude to write an email, you can edit the email directly within the app instead of copying and pasting it.


**Pradhan:**  That's actually pretty cool! It's like making these AI models more collaborative.

**Rishi:**  Exactly.  It's a step beyond just chatbots, pushing these models toward a more integrated workflow.

**Pradhan:**  So, is it just a better model, or is Anthropic trying to do something different with it?

**Rishi:**  That's a good question.  It seems like they are aiming to integrate Claude into the workplace, turning it from a conversational AI into a "collaborative work environment." They're also focusing on features that personalize the experience, like remembering user preferences.

**Pradhan:**  That's pretty ambitious.  It sounds like they're aiming for more than just a "better" AI model; they want to build a whole ecosystem around it.

**Rishi:**  That's right. And they're not just throwing out these models haphazardly. They're releasing them in a strategic way, with different tiers based on speed and capabilities.  Claude 3.5 Sonnet is essentially the middle child, while they have a "Haiku" model for lighter tasks and an "Opus" model for more complex ones.

**Pradhan:**  I have to admit, I love the names.  It's like they're creating their own little AI poetry club.

**Rishi:**  I know, right?  It's a bit whimsical, but it helps differentiate them from the more serious, corporate-focused OpenAI.

**Pradhan:**  So, where does all this leave us in the AI arms race?

**Rishi:** It seems like the race is still on. Anthropic is definitely making its mark, but OpenAI is still a major player.  And then there's Google with Gemini, Meta with Llama, and everyone else trying to keep up.

**Pradhan:**  It's definitely exciting times to be alive.  Who knows what's going to happen next in the world of AI?

**Rishi:**  I can't wait to see what happens.  But for now, I'm going to enjoy my weekend and try not to get too caught up in the AI frenzy.

**Pradhan:**  You and me both.  But hey, at least we have this podcast to keep us in the loop!

**Rishi:**  That's true, Pradhan. That's true.  Cheers to that!""",
            "path": f'custom/custom_article20240624193525.mp3',
            "source": 'https://www.aboutamazon.com/news/aws/amazon-bedrock-anthropic-ai-claude-3-5-sonnet',
            "custom": "true",
            "date" : firestore.SERVER_TIMESTAMP,
            "summary": "Anthropic has released a new model, Claude 3.5 Sonnet, which is faster, smarter, and has vision capabilities. The model outperforms GPT-4o in several areas and is more ethical. It features a new workspace called 'Artifacts' that allows users to interact with the AI's output in real-time. Anthropic is aiming to integrate Claude into the workplace and create a collaborative work environment."
        })
       
       return "article20240624193525"

    fromlink = False

    if text.startswith("https://") or text.startswith("http://"):
        try:
            article = Article(text)
            article.download()
            article.parse()
        except:
            return "error"
        print(article.text)
        context = article.text
        combined_string = text
        fromlink = True
    else:
        
        fromlink = False

        try:
            context, links = sonar_test(text)
            combined_string = text
        except Exception as e:
            print("error with pplx: ", e)
            return "error"
       

    current_datetime = datetime.datetime.now()
    current_int = int(current_datetime.strftime("%Y%m%d%H%M%S"))
    #current_int = 69

    length_dict = {2: 500, 4: 800, 6: 1400, 8: 1800, 10: 2000}
    length = length_dict[int(length)]

    try:
        transcript = gemini_test(combined_string, isNews, context, style, length)

    except Exception as e:
        print("error with llm: ", e)
        transcript = 'error'

    try:
        audio_file_path, length = generate_audio(transcript, current_int, True, voice1_name, voice2_name, voice1_id, voice2_id, False)
    except Exception as e:
        print("error with audio outside: ", e)
        audio_file_path = 'error'       
    summary = generate_summary(transcript)

   
    try:
        doc_ref = db.collection("users").document(user).collection("files").document(f"article{current_int}")
        if fromlink:
            title = generate_title(transcript)
            write1 = doc_ref.set({
                "title": title,
                "transcript": transcript,
                "path": f'custom/custom_article{current_int}.mp3',
                "source": text,
                "custom": "true",
                "date": firestore.SERVER_TIMESTAMP,
                "summary": summary,
                "length": length
            })
        elif isNews:
            title = generate_title(transcript)
            write1 = doc_ref.set({
                "title": title,
                "transcript": transcript,
                "path": f'custom/custom_article{current_int}.mp3',
                "source": links,
                "custom": "true",
                "date": firestore.SERVER_TIMESTAMP,
                "summary": summary,
                "length": length
            })
        else:
            title = generate_title(transcript)
            write1 = doc_ref.set({
                "title": title,
                "transcript": transcript,
                "path": f'custom/custom_article{current_int}.mp3',
                "source": links,
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

    except Exception as e:
        print("error with firebase: ", e)
        return "error"
