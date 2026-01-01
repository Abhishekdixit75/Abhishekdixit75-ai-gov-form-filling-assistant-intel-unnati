import whisper
import os

class VoiceInputProcessor:
    def __init__(self, model_size="small"):
        # Load the model only once
        # "small" is much better for Hindi/English mix than "base"
        print(f"Loading Whisper model '{model_size}'...")
        self.model = whisper.load_model(model_size)
        print("Whisper model loaded.")

    def transcribe(self, audio_path: str) -> str:
        """
        Converts audio file to text using OpenAI Whisper.
        """
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
        # Transcribe - let Whisper auto-detect language
        # fp16=False is required for CPU execution to avoid warnings/errors
        result = self.model.transcribe(
            audio_path, 
            fp16=False,
            language=None,  # Auto-detect language
            task="transcribe"
        )
        return result["text"]
