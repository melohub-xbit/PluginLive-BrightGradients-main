from transformers import pipeline

model_path = "hindi_models/whisper-medium-hi_alldata_multigpu"
device = "cuda"
lang_code = "hi"

whisper_asr = pipeline("automatic-speech-recognition", model=model_path, device=device)

def transcribe_audio(audio_path):
    '''
    This function transcribes the audio file using the whisper model.
    Args:
        audio_path (str): The path to the audio file.
    Returns:
        str: The transcribed text.
    '''
    transcription = whisper_asr(audio_path, language=lang_code)
    return transcription["text"]