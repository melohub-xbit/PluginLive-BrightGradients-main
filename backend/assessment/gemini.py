import os
import json
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

genai.configure(api_key=os.environ["GOOGLE_AI_API_KEY"])

def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file

def format_gemini_response(response_text):
    # Parse the string into a Python dictionary
    response_dict = json.loads(response_text)
    
    # Optional: Pretty print the JSON with proper indentation
    formatted_json = json.dumps(response_dict, indent=2)
    
    return response_dict  # Return dictionary for programmatic use

def get_candidate_assessment(file_url, question):
    """
    Get structured feedback from Gemini for an audio response
    
    Args:
        file_url (str): Path to the audio file (from cloudinary)
        question (str): The question that was asked to the candidate
    
    Returns:
        dict: Structured feedback in JSON format
    """
      
    # Create system prompt with dynamic question
    system_prompt = f"""You are a senior communication assessment coach specializing in speech training. 
    Your task is to evaluate a candidate's audio response to the question, "{question}." 
    Provide a detailed assessment that includes the following:

    1. **Transcript**: A written transcript of the candidate's audio response.
    2. **General Feedback**: Overall impressions of the response.
    3. **Sentence Structuring and Grammar**: Assessment of sentence flow and grammatical accuracy.
    4. **Speaking Rate**: Rate of speech, rated on a scale from 1 (very slow) to 5 (very fast).
    5. **Number of Pauses**: Count of noticeable pauses during the response.
    6. **Pause Patterns**: Analysis of pause placement and its impact on delivery.
    7. **Filler Word Usage**: Count and examples of filler words (e.g., "like," "um," "uh").
    8. **Overall Confidence**: Evaluation of how confident the candidate appears.
    9. **Advanced Parameters**: Detailed analysis of tone, enunciation, articulation, and intelligibility.

    Additionally, provide **timestamped feedback** (e.g., "HH:MM:SS") for specific moments in the response that require improvement.
    This personalized feedback will help the candidate identify and address key aspects of their communication skills.

    Ensure clarity and precision in the evaluation to make the assessment as actionable as possible."""
    generation_config = {
      "temperature": 1,
      "top_p": 0.95,
      "top_k": 40,
      "max_output_tokens": 8192,
      "response_schema": content.Schema(
        type = content.Type.OBJECT,
        enum = [],
        required = ["general_feedback", "sentence_structuring_and_grammar", "speaking_rate", "pause_pattern", "filler_word_usage", "timestamped_feedback", "advanced_parameters", "transcript"],
        properties = {
          "general_feedback": content.Schema(
            type = content.Type.STRING,
          ),
          "sentence_structuring_and_grammar": content.Schema(
            type = content.Type.STRING,
          ),
          "speaking_rate": content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["rate", "comment"],
            properties = {
              "rate": content.Schema(
                type = content.Type.NUMBER,
              ),
              "comment": content.Schema(
                type = content.Type.STRING,
              ),
            },
          ),
          "pause_pattern": content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["count", "comment"],
            properties = {
              "count": content.Schema(
                type = content.Type.INTEGER,
              ),
              "comment": content.Schema(
                type = content.Type.STRING,
              ),
            },
          ),
          "filler_word_usage": content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["count", "comment"],
            properties = {
              "count": content.Schema(
                type = content.Type.INTEGER,
              ),
              "comment": content.Schema(
                type = content.Type.STRING,
              ),
            },
          ),
          "timestamped_feedback": content.Schema(
            type = content.Type.ARRAY,
            items = content.Schema(
              type = content.Type.OBJECT,
              enum = [],
              required = ["time", "feedback"],
              properties = {
                "time": content.Schema(
                  type = content.Type.STRING,
                ),
                "feedback": content.Schema(
                  type = content.Type.STRING,
                ),
              },
            ),
          ),
          "advanced_parameters": content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["articulation", "enunciation", "tone", "intelligibility"],
            properties = {
              "articulation": content.Schema(
                type = content.Type.STRING,
              ),
              "enunciation": content.Schema(
                type = content.Type.STRING,
              ),
              "tone": content.Schema(
                type = content.Type.STRING,
              ),
              "intelligibility": content.Schema(
                type = content.Type.STRING,
              ),
            },
          ),
          "transcript": content.Schema(
            type = content.Type.STRING,
          ),
        },
      ),
      "response_mime_type": "application/json",
    }

    # Initialize model
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction=system_prompt,
    )

    # Upload audio file
    audio_file = genai.upload_file(file_url, mime_type="audio/wav")

    # Start chat session
    chat_session = model.start_chat(
        history=[
            {
                "role": "user",
                "parts": [
                    audio_file,
                    "Provide assessment for this candidate.",
                ],
            }
        ]
    )

    # Get response
    response = chat_session.send_message("Analyze the audio response")
    
    return (format_gemini_response(response.text))

def refine_transcript(transcript1, transcript2):
  '''
    This function takes two transcripts as input and returns a refined transcript by combining the two. The first transcript is by gemini and second is from AI4Bharat model. They are refined by combining the two transcripts. The similarity can also be inferred to as the confidence with which the transcripts seem to be authentic.
    Args:
        transcript1 (str): The first transcript to be refined. (gemini)
        transcript2 (str): The second transcript to be refined. (AI4Bharat)
    Returns:
        number: The similarity between the two transcripts.
        str: The refined transcript.
  '''

  # Create the model
  generation_config = {
      "temperature": 1,
      "top_p": 0.95,
      "top_k": 40,
      "max_output_tokens": 8192,
      "response_schema": content.Schema(
        type = content.Type.OBJECT,
        enum = [],
        required = ["similarity", "transcript"],
        properties = {
          "similarity": content.Schema(
            type = content.Type.NUMBER,
          ),
          "transcript": content.Schema(
            type = content.Type.STRING,
          ),
        },
      ),
      "response_mime_type": "application/json",
  }

  model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction="\nYou are a senior English communication and speech analysis expert. Given two transcripts of the same audio file, your task is to:\n\nAssess Similarity: Compare the two transcripts to determine their similarity. If they differ, evaluate the degree of difference.\nCombine Transcripts: Create a final version by merging the transcripts into the most natural and cohesive version. Ensure this final transcript retains all original mistakes and speech errors from both the transcripts.\nYour output should include:\n\nSimilarity Score: A numerical score representing the similarity between the two transcripts.\nFinal Transcript: The merged transcript that preserves every speech error, filler word, and grammatical mistake from the both transcripts.\nProvide an accurate and detailed output, ensuring the integrity of the speaker's original speech is maintained.",
  )

  chat_session = model.start_chat(
    history=[
      {
        "role": "user",
        "parts": [
          f"Transcript 1: {transcript1} Transcript 2: {transcript2}",
        ],
      },
    ]
  )

  response = chat_session.send_message("Analyze the transcripts and provide a refined transcript.")

  return format_gemini_response(response.text)
