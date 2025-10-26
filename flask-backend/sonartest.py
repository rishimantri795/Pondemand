

from openai import OpenAI
import os
from dotenv import load_dotenv


def sonar_test(text):
    load_dotenv()

    YOUR_API_KEY = os.getenv('SONAR_API_KEY')

    messages = [
        {
            "role": "system",
            "content": (
                "You are an artificial intelligence assistant and you need to "
                "engage in a helpful, detailed, polite conversation with a user."
            ),
        },
        {   
            "role": "user",
            "content": (
                "Give me all the information you have on the topic: " + text + ". If its a current event, give me all the comprehensive latest updates. If not, give me all the relevant facts about the topic. Be comprehensive"
            ),
        },
    ]

    client = OpenAI(api_key=YOUR_API_KEY, base_url="https://api.perplexity.ai")

    response = client.chat.completions.create(
        model="sonar",
        messages=messages,
    )
    

    return (response.choices[0].message.content, response.citations)

if __name__ == "__main__":
    sonar_test("The Apollo 11 moon landing")

