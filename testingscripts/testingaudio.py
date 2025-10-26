from audio import generate_audio
from ondemand import on_demand
import newspaper
from newspaper import Article

def main():
    text = '''**Sachi:** Hey Bramhi, did you hear about Meta's latest AI toys for advertisers?

**Bramhi:** Oh yeah, I've been hearing rumblings about that. What's the scoop?

**Sachi:** They're rolling out some fancy new features. You can now create entire images from scratch, not just change the background.

**Bramhi:** That's pretty cool. It could save advertisers a lot of time and effort.

**Sachi:** True, but it also raises some ethical concerns. What if advertisers use these tools to create images of products that don't actually exist?      

**Bramhi:** I see your point. That could be dangerous if used irresponsibly. It's like digital snake oil.

**Sachi:** Meta claims they have guardrails in place to prevent that. They say they use AI to filter out inappropriate and low-quality images.

**Bramhi:** That's good to know. It's important to have safeguards to prevent abuse.

**Sachi:** Another interesting feature is the "text overlay" option. Advertisers can now add text to the images they generate.

**Bramhi:** That gives them even more control over the message they're sending. But I'm wondering if it could get cluttered and distracting.

**Sachi:** Time will tell. I'm curious to see how advertisers use these new tools. It could be a game-changer for online marketing.

**Bramhi:** And don't forget, Meta is also expanding their Meta Verified subscription service to businesses.

**Sachi:** Oh, right! That's the one with the blue checkmark and exclusive perks.

**Bramhi:** Yep. And now there will be different tiers with additional features like profile enhancements and connection-building tools.

**Sachi:** It's clear that Meta is betting big on AI and subscriptions. It'll be interesting to see how these developments impact the digital advertising landscape.

**Bramhi:** Definitely. It's like the Wild West out there. Stay tuned for more twists and turns.'''
    #generate_audio(text)

    topic = input("What do you want to know about?: ")


    on_demand(topic)


    
if __name__ == '__main__':
    main()