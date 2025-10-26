from elevenlabs import ElevenLabs
from typing import Optional, Tuple, Dict
import os
from dotenv import load_dotenv
import datetime

load_dotenv()


# Initialize ElevenLabs client
client = ElevenLabs(api_key=os.getenv('ELEVEN_API_KEY'))


def clone_voice(voice_file) -> str:
    """Clone a voice using ElevenLabs API and return the voice ID."""
    try:
        # Add voice to ElevenLabs
        response = client.voices.add(
            name=f"cloned_voice_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
            files=[voice_file]
        )
        return response.voice_id
    except Exception as e:
        print(f"Error cloning voice: {str(e)}")
        raise


def delete_voice(voice_id: str) -> None:
    """Delete a cloned voice using ElevenLabs API."""
    try:
        client.voices.delete(voice_id)
    except Exception as e:
        print(f"Error deleting voice: {str(e)}")
        raise

def retrieve_voice_ids(
    voice1_type: str,
    voice2_type: str,
    voice1_file: Optional[bytes] = None,
    voice2_file: Optional[bytes] = None,
    voice1_name: Optional[str] = None,
    voice2_name: Optional[str] = None
) -> Tuple[str, str]:
    """
    Get voice IDs for both voices based on their types (custom/preset).
    
    Args:
        voice1_type: 'custom' or 'preset'
        voice2_type: 'custom' or 'preset'
        voice1_file: Audio file for voice1 if custom
        voice2_file: Audio file for voice2 if custom
        voice1_name: Preset name for voice1 if preset
        voice2_name: Preset name for voice2 if preset
    
    Returns:
        Tuple[str, str]: (voice1_id, voice2_id)
    """
    voice1_id = None
    voice2_id = None

    presets = {
        "Jennifer": "56AoDkrOh6qfVPDXZ7Pt",
        "Mason": "gs0tAILXbY5DNrJrsM6F",
        "Charlie": "IKne3meq5aSn9XLyUdCD",
    }

    try:
        # Handle Voice 1
        if voice1_type == 'custom':
            if not voice1_file:
                raise ValueError("Voice 1 file required for custom voice")
            
            voice1_id = clone_voice(voice1_file)
        else:
            if not voice1_name:
                raise ValueError("Voice 1 name required for preset voice")
            voice1_id = presets[voice1_name]
            if not voice1_id:
                raise ValueError(f"Preset voice not found: {voice1_name}")

        # Handle Voice 2
        if voice2_type == 'custom':
            if not voice2_file:
                raise ValueError("Voice 2 file required for custom voice")
            voice2_id = clone_voice(voice2_file)
        else:
            if not voice2_name:
                raise ValueError("Voice 2 name required for preset voice")
            voice2_id = presets[voice2_name]
            if not voice2_id:
                raise ValueError(f"Preset voice not found: {voice2_name}")

        return voice1_id, voice2_id

    except Exception as e:
        print(f"Error retrieving voice IDs: {str(e)}")
        raise

if __name__ == "__main__":
    # Example usage
    voice1_id, voice2_id = retrieve_voice_ids(
        voice1_type='custom',
        voice2_type='preset',
        voice1_file=open("Recording.wav", "rb"),
        voice2_file=None,
        voice1_name=None,
        voice2_name="Jennifer"
    )