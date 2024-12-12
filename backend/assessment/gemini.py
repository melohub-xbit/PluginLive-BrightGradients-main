import os
import json
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
import dotenv

dotenv.load_dotenv()

genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))

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
    audio_file = genai.upload_file(file_url, mime_type="audio/webm")

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

def get_final_summary(feedbacks):
  '''
    This function takes a list of feedbacks as input and returns a summary of the feedbacks.
    Args:
        feedbacks (list): A list of feedbacks along with the questions.
    Returns:
        str: The summary of the feedbacks.
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
      required = ["overall_feedback", "advanced"],
      properties = {
        "overall_feedback": content.Schema(
          type = content.Type.OBJECT,
          enum = [],
          required = ["summary", "key_strengths", "areas_of_improvement"],
          properties = {
            "summary": content.Schema(
              type = content.Type.STRING,
            ),
            "key_strengths": content.Schema(
              type = content.Type.STRING,
            ),
            "areas_of_improvement": content.Schema(
              type = content.Type.STRING,
            ),
          },
        ),
        "advanced": content.Schema(
          type = content.Type.OBJECT,
          enum = [],
          required = ["articulation", "enunciation", "intelligibility", "tone", "filler_word_usage", "pause_pattern", "speaking_rate", "actionable_recommendations", "personalized_examples"],
          properties = {
            "articulation": content.Schema(
              type = content.Type.STRING,
            ),
            "enunciation": content.Schema(
              type = content.Type.STRING,
            ),
            "intelligibility": content.Schema(
              type = content.Type.STRING,
            ),
            "tone": content.Schema(
              type = content.Type.STRING,
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
            "sentence_structuring_and_grammar": content.Schema(
              type = content.Type.STRING,
            ),
            "speaking_rate": content.Schema(
              type = content.Type.OBJECT,
              enum = [],
              required = ["rate", "comment"],
              properties = {
                "rate": content.Schema(
                  type = content.Type.INTEGER,
                ),
                "comment": content.Schema(
                  type = content.Type.STRING,
                ),
              },
            ),
            "actionable_recommendations": content.Schema(
              type = content.Type.ARRAY,
              items = content.Schema(
                type = content.Type.OBJECT,
                enum = [],
                required = ["recommendation", "reason"],
                properties = {
                  "recommendation": content.Schema(
                    type = content.Type.STRING,
                  ),
                  "reason": content.Schema(
                    type = content.Type.STRING,
                  ),
                },
              ),
            ),
            "personalized_examples": content.Schema(
              type = content.Type.ARRAY,
              items = content.Schema(
                type = content.Type.OBJECT,
                enum = [],
                required = ["feedback", "line"],
                properties = {
                  "feedback": content.Schema(
                    type = content.Type.STRING,
                  ),
                  "line": content.Schema(
                    type = content.Type.STRING,
                  ),
                },
              ),
            ),
          },
        ),
      },
    ),
    "response_mime_type": "application/json",
  }

  model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction="You are an advanced communication analysis and report generation expert. Your task is to summarize the results of a 5-question communication skills quiz, where each question includes detailed feedback in the following format:  \n\n### Input Format (Example Feedback):  \n```json\n{\n  \"advanced_parameters\": {\n    \"articulation\": \"Articulation is clear, but could be improved for a more polished delivery.\",\n    \"enunciation\": \"Enunciation is understandable but lacks precision at times.\",\n    \"intelligibility\": \"The response is mostly intelligible, though some words are mumbled.\",\n    \"tone\": \"The tone is somewhat hesitant and lacks confidence.\"\n  },\n  \"filler_word_usage\": {\n    \"comment\": \"The response includes a noticeable pause and lack of a clear direction in the middle of the introduction, indicating a lack of preparation and potentially nervousness.\",\n    \"count\": 1\n  },\n  \"general_feedback\": \"The candidate's self-introduction is brief and lacks detail. It is unclear why the candidate wants to change careers. The introduction needs significant improvement to be effective.\",\n  \"pause_pattern\": {\n    \"comment\": \"The significant pause in the middle of the response disrupts the flow and suggests a lack of preparation or confidence. Pauses should be used strategically.\",\n    \"count\": 2\n  },\n  \"sentence_structuring_and_grammar\": \"Sentence structure is simple but grammatically correct. The response would benefit from more structured and comprehensive sentences.\",\n  \"speaking_rate\": {\n    \"comment\": \"The speaking rate is slow in places, adding to the perception of hesitancy.\",\n    \"rate\": 2\n  },\n  \"timestamped_feedback\": [\n    {\n      \"feedback\": \"Improve the flow here by eliminating the long pause and elaborating on your career change aspirations.\",\n      \"time\": \"00:00:08\"\n    },\n    {\n      \"feedback\": \"Add more detail about your experience and skills. Quantify your achievements whenever possible.\",\n      \"time\": \"00:00:15\"\n    }\n  ],\n  \"transcript\": \"Hello, I am Sunhit Goswami. I am a marketing manager at Salesforce. I want to uh change my career now. I enjoy marketing. Thank you.\"\n}\n```  \n\n### Task Requirements:  \nAnalyze and combine the feedback from all 5 responses into a **comprehensive final assessment** that includes the following sections:  \n\n1. **Overall Feedback**: Summarize the key strengths and areas for improvement across all responses.  \n2. **Rubric-Specific Insights**:  \n   - Articulation, Enunciation, Intelligibility, and Tone  \n   - Filler Word Usage and Pauses  \n   - Sentence Structuring and Grammar  \n   - Speaking Rate  \n3. **Actionable Recommendations**: Provide targeted advice on how to improve the candidate's communication skills based on recurring patterns in the feedback.  \n4. **Personalized Examples**: Highlight 2–3 specific timestamped examples where the candidate can make significant improvements.  \n5. **Final Transcript Commentary**: Include observations on how the candidate's responses align or diverge from the intended communication goals.  \n\n### Additional Output:\nStructure the output to be ready for generating a PDF report, ensuring clear sections and formatting for professional presentation.  \n\nMake the summary detailed, actionable, and tailored to help the candidate improve effectively.\n\nHere is an example of the summary:\n{\n  \"overall_feedback\": {\n    \"summary\": \"The candidate demonstrates a basic understanding of communication but requires significant improvement in delivery and structure.\",\n    \"key_strengths\": [\"Clear articulation\", \"Basic grammar usage\"],\n    \"areas_for_improvement\": [\"Confidence in tone\", \"Detailed and structured responses\", \"Reduced filler word usage\"]\n  },\n  \"rubric_specific_insights\": {\n    \"articulation\": \"Mostly clear but lacks polish.\",\n    \"enunciation\": \"Understandable but needs greater precision.\",\n    \"intelligibility\": \"Generally intelligible, with occasional mumbling.\",\n    \"tone\": \"Hesitant and lacks confidence.\",\n    \"filler_word_usage\": {\n      \"count\": 5,\n      \"comment\": \"Frequent use of 'um' and 'uh,' suggesting nervousness.\"\n    },\n    \"pause_pattern\": {\n      \"count\": 3,\n      \"comment\": \"Pauses disrupt flow and appear unintentional.\"\n    },\n    \"sentence_structuring_and_grammar\": \"Basic sentence structure with room for more complex constructions.\",\n    \"speaking_rate\": {\n      \"rate\": 2,\n      \"comment\": \"Slow speaking rate creates an impression of hesitancy.\"\n    }\n  },\n  \"actionable_recommendations\": [\n    {\n      \"recommendation\": \"Practice delivering responses with more confidence.\",\n      \"reason\": \"A confident tone will enhance audience engagement.\"\n    },\n    {\n      \"recommendation\": \"Reduce filler words through practice.\",\n      \"reason\": \"Eliminating filler words will create a more professional impression.\"\n    }\n  ],\n  \"personalized_examples\": [\n    {\n      \"feedback\": \"Clarify your career change aspirations.\",\n      \"line\": \"So I now uh want to change into marketing\"\n    },\n    {\n      \"feedback\": \"Add more detail about your skills and achievements.\",\n      \"line\": \"I won a competition in India\"\n    }\n  ],\n  \"final_transcript_commentary\": \"The transcript reflects a hesitant speaker with basic structure and clarity but requires better detail and fluency.\"\n}\n",
  )

  chat_session = model.start_chat(
    history=[
      {
        "role": "user",
        "parts": [
          f"""Here are the 5 individual feedbacks along with their questions:
            {feedbacks}           
            \n Provide a summary of the feedbacks.""",
        ],
      },
    ]
  )

  response = chat_session.send_message("Generate feedback.")

  return format_gemini_response(response.text)

def get_graph_data(feedbacks):
  '''
    This function takes a list of feedbacks as input and returns a summary of the feedbacks.
    Args:
        feedbacks (list): A list of feedbacks along with the questions.
    Returns:
        json: Data through which the graph is plotted.
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
      required = ["tone", "speaking_rate", "clarity", "articulation", "enunciation", "sentence_structuring", "pause_count", "filler_word_count"],
      properties = {
        "tone": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.NUMBER,
          ),
        ),
        "speaking_rate": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.NUMBER,
          ),
        ),
        "clarity": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.NUMBER,
          ),
        ),
        "articulation": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.NUMBER,
          ),
        ),
        "enunciation": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.NUMBER,
          ),
        ),
        "sentence_structuring": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.NUMBER,
          ),
        ),
        "pause_count": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.INTEGER,
          ),
        ),
        "filler_word_count": content.Schema(
          type = content.Type.ARRAY,
          items = content.Schema(
            type = content.Type.INTEGER,
          ),
        ),
      },
    ),
    "response_mime_type": "application/json",
  }

  model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction="You are an advanced AI system tasked with extracting **graphable data** from the given final feedback and feedbacks for each question. The extracted data should be structured to allow easy visualization using Python libraries like `matplotlib` or `seaborn`.  \n\n### **Input Details**:\n1. **Final Feedback**:\n   - Metrics such as tone, speaking rate, filler word usage, clarity, pause patterns, etc.\n2. **Feedback for Each Question**:\n   - Metrics for articulation, enunciation, intelligibility, tone, filler word usage, speaking rate, pause patterns, and sentence structuring.\n   - Counts or scores (e.g., filler word counts, pauses) and qualitative insights (e.g., tone confidence level).\n\n### **Output Requirements**:\nProvide graph data as a JSON object with the following structure:  \n\n1. **Trends Across Questions**:\n   - An array for each parameter showing its value across the 5 questions.  \n   - Example parameters:\n     - **Tone**: Confidence levels (e.g., 1-5 scale).\n     - **Speaking Rate**: A numerical score or count.\n     - **Filler Word Usage**: Count per question.\n     - **Clarity/Intelligibility**: Score or qualitative rating converted to a numerical value.\n     - **Pause Pattern**: Number of pauses per question.\n\n2. **Aggregate Metrics**:\n   - Final averages or cumulative values for each parameter.  \n\n3. **Data Structure Example**:\n```json\n{\n     \"tone\": [3.2, 3.5, 3.0, 4.0, 3.8],  // Tone confidence levels (1-5 scale per question)\n    \"speaking_rate\": [2.5, 3.0, 2.8, 3.2, 3.1],  // Speaking rate scores per question\n    \"filler_word_count\": [4, 3, 5, 2, 6],  // Count of filler words per question\n    \"clarity\": [4.0, 3.8, 4.2, 3.9, 4.1],  // Clarity/intelligibility scores (1-5 scale)\n    \"pause_count\": [2, 3, 1, 4, 2],  // Number of pauses per question\n    \"articulation\": [4.5, 4.2, 4.0, 3.8, 4.1],  // Articulation scores (1-5 scale)\n    \"enunciation\": [4.0, 3.9, 3.8, 4.1, 4.0],  // Enunciation scores (1-5 scale)\n    \"sentence_structuring\": [3.5, 3.8, 4.0, 3.7, 4.2]  // Sentence structuring quality (1-5 scale)\n  \"aggregate_metrics\": {\n    \"average_tone\": 3.5,\n    \"total_filler_words\": 20,\n    \"average_clarity\": 4.0,\n    \"total_pauses\": 12\n  }\n}\n```\n\n4. **Data Normalization**:\n   - Where applicable, normalize qualitative insights into a consistent numerical scale (e.g., 1-5 for tone or clarity).  \n\n### **Tone and Language**:\n- Deliver the output in a clear and structured JSON format.\n- Ensure all values are easy to interpret and suitable for direct use in graph plotting.",
  )

  chat_session = model.start_chat(
    history=[
      {
        "role": "user",
        "parts": [
          f"""{feedbacks}""",
        ],
      },
    ]
  )

  response = chat_session.send_message("Generate the graph.")

  return format_gemini_response(response.text)