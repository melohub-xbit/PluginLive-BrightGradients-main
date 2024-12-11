from fastapi import APIRouter, Depends, File, UploadFile
from db.init_db import Database
from .auth import get_current_user
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
import os
import dotenv
import json
from assessment.gemini import *
from moviepy import VideoFileClip
import io

dotenv.load_dotenv()

router_record = APIRouter()

from fastapi import APIRouter, Depends, File, UploadFile, Form
from db.init_db import Database
from .auth import get_current_user

#genai model
genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

router_record = APIRouter()

@router_record.get("/generate-questions")
async def generate_questions():
    print("In generate_questions")
    system_prompt = """Role: You are a communication coach designing engaging and insightful questions to assess and enhance people's speaking abilities while reflecting on their personal growth and interpersonal skills.

Objective: Develop 7-10 thought-provoking questions that explore a variety of scenarios—professional, personal, and social—to assess communication skills while encouraging self-reflection, creativity, and depth.

Guidelines for the Questions
Scenario Diversity: Include both workplace challenges and real-life situations, blending storytelling with problem-solving.
Key Competencies:
Storytelling & Expression: Questions should encourage vivid, structured, and relatable storytelling.
Leadership Skills: Situations that reveal the candidate's ability to lead, inspire, and navigate conflict.
Overcoming Barriers: Explore how candidates handle communication breakdowns or barriers.
Moral Reflection: Test ethical reasoning and the ability to articulate personal values.
Social Etiquette: Assess how they handle interpersonal relationships with tact and professionalism.
Resilience and Personal Growth: Situations that require reflection on overcoming personal or professional difficulties.
Engagement: Questions should evoke creative, detailed, and natural responses.
Tone: Maintain a balance between light, approachable topics and deeper, thought-provoking ones.
Question Examples
Workplace Scenario:
"Describe a time when you had to give feedback to a colleague or team member that was difficult to deliver. How did you approach it, and what was the outcome?"

Storytelling & Expression:
"Share a personal experience where you made a significant decision that changed your life. What factors influenced your choice, and how did it shape who you are today?"

Leadership in Action:
"Imagine you're leading a project with a team facing a tight deadline and low morale. What specific steps would you take to motivate the team and ensure the project is completed successfully?"

Overcoming Communication Barriers:
"Describe a situation where you faced a communication barrier with someone from a different background or perspective. How did you bridge the gap and find common ground?"

Morals & Values:
"Talk about a time when you faced an ethical dilemma at work or in your personal life. How did you navigate it, and what values guided your decision-making?"

Social Etiquette & Tact:
"You're attending a networking event where you don't know anyone. How would you initiate conversations and leave a positive impression on the people you meet?"

Resilience:
"Reflect on a personal or professional setback you experienced. How did you handle the situation, and what lessons did you take away from it?"

Conflict Resolution:
"Describe a time when you had to mediate a conflict between two people or groups. What approach did you take, and what was the outcome?"

Personality & Humor:
"If you could host a dinner with three people, living or historical, who would they be and why? What would you talk about?"

Vision & Creativity:
"Imagine you are asked to give a motivational speech to a group of young professionals just starting their careers. What would your key message be, and why?"

Outcome of Responses
Gain insights into the candidate's ability to organize thoughts, articulate clearly, and connect with an audience.
Evaluate their emotional intelligence, leadership style, and adaptability.
Identify how well they express personal and professional values, resilience, and vision."""

    print("assigned system prompt")
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_schema": content.Schema(
            type = content.Type.OBJECT,
            enum = [],
            required = ["questions"],
            properties = {
            "questions": content.Schema(
                type = content.Type.ARRAY,
                items = content.Schema(
                type = content.Type.STRING,
                ),
            ),
            },
        ),
        "response_mime_type": "application/json",
        }
    print("assigned generation config")

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction=system_prompt
    )

    response = model.generate_content("Generate 5 professional communication assessment questions")
    print("response generated")
    print(response.text)
    print("response printed")
    print(response)
    questions = json.loads(response.text)
    print("questions loaded")
    print(questions)
    return questions

@router_record.post("/save-video")
async def save_video(
    video_file: UploadFile = File(...),
    question: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    video_data = {
        "file": await video_file.read(),
        "filename": video_file.filename,
        "content_type": video_file.content_type,
        "user_id": str(current_user["_id"])
    }

    # Read video bytes into memory
    video_bytes = await video_file.read()
    
    # Create temporary video file
    with io.BytesIO(video_bytes) as video_buffer:
        video_clip = VideoFileClip(video_buffer)
        # Extract audio
        audio_clip = video_clip.audio
        
        # Save audio to memory buffer
        audio_buffer = io.BytesIO()
        audio_clip.write_audiofile(audio_buffer, codec='mp3')
        audio_bytes = audio_buffer.getvalue()
        candidate_assess = get_candidate_assessment(question=question, file_url=audio_bytes)
        
        # Clean up
        audio_clip.close()
        video_clip.close()

        print("got feedback")
        print(candidate_assess)
    result = await Database.save_video(video_data)
    return {"url": result["url"]}

