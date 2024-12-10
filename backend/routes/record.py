from fastapi import APIRouter, Depends, File, UploadFile
from db.init_db import Database
from .auth import get_current_user
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
import os
import dotenv
import json

dotenv.load_dotenv()

router_record = APIRouter()

from fastapi import APIRouter, Depends, File, UploadFile, Form
from db.init_db import Database
from .auth import get_current_user

#genai model
genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

router_record = APIRouter()

@router_record.get("/generate-questions")
async def generate_questions():
    system_prompt = """You are a communication coach designing engaging questions to assess people's speaking abilities.
                Create 5 thought-provoking questions that blend professional and personal scenarios.
                
                The questions should:
                - Include both workplace and real-life situations
                - Test storytelling abilities and personal expression
                - Encourage detailed, natural responses
                - Range from professional scenarios to lighter topics
                - Focus on experiences that showcase communication style
                - Allow personality to shine through while maintaining professionalism
                
                Aim for questions that make people think creatively while staying relevant to communication skills assessment."""

    generation_config = {
        "temperature": 0.8,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 1024,
        "response_schema": content.Schema(
            type=content.Type.OBJECT,
            properties={
                "question1": content.Schema(type=content.Type.STRING),
                "question2": content.Schema(type=content.Type.STRING),
                "question3": content.Schema(type=content.Type.STRING),
                "question4": content.Schema(type=content.Type.STRING),
                "question5": content.Schema(type=content.Type.STRING)
            },
            required=["question1", "question2", "question3", "question4", "question5"]
        ),
        "response_mime_type": "application/json"
    }

    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
        system_instruction=system_prompt
    )

    response = model.generate_content("Generate 5 professional communication assessment questions")
    questions = json.loads(response.text)
    return questions

@router_record.post("/save-video")
async def save_video(
    video_file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    video_data = {
        "file": await video_file.read(),
        "filename": video_file.filename,
        "content_type": video_file.content_type,
        "user_id": str(current_user["_id"])
    }
    result = await Database.save_video(video_data)
    return {"url": result["url"]}

