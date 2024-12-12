from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from db.init_db import Database
from .auth import get_current_user
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
import os
import dotenv
import json
from assessment.gemini import *
import io
from typing import List
from pydantic import BaseModel
from assessment.nonverbal import CommunicationAnalyzer
from uuid import uuid4
from util.report_gen import *

class FeedbackItem(BaseModel):
    question: str
    feedback: dict  # Or a more specific Pydantic model if the feedback structure is known

dotenv.load_dotenv()

router_record = APIRouter()

from fastapi import APIRouter, Depends, File, UploadFile, Form
from db.init_db import Database
from .auth import get_current_user

genai.configure(api_key=os.getenv('GOOGLE_AI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

router_record = APIRouter()

@router_record.get("/generate-questions")
async def generate_questions(
    current_user: dict = Depends(get_current_user)
):
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

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        system_instruction=system_prompt
    )

    response = model.generate_content("Generate 5 professional communication assessment questions")

    questions = json.loads(response.text)
    quiz_id = str(uuid4())

    return {"questions": questions, "quiz_id": quiz_id}

class FinalFeedbackRequest(BaseModel):
    feedbackWithQuestions: dict
    currentQuizId: str

@router_record.post("/final-feedback")
async def final_feedback(
    request: FinalFeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = get_final_summary(feedbacks=request.feedbackWithQuestions)
        print(request.currentQuizId)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router_record.post("/save-video")
async def save_video(
    video_file: UploadFile = File(...),
    audio_file: UploadFile = File(...),
    question: str = Form(...),
    quiz_id: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    video_data = {
        "file": await video_file.read(),
        "filename": video_file.filename,
        "content_type": video_file.content_type,
        "user_id": str(current_user["_id"])
    }
 
     # Read audio file into bytes
    audio_bytes = await audio_file.read()
    
    # Create a temporary file-like object in memory
    audio_buffer = io.BytesIO(audio_bytes)
    audio_buffer.name = 'audio.webm'  # Give it a name for mime type detection

    # verbal feedback
    candidate_assess = get_candidate_assessment(question=question, file_url=audio_buffer)

    # non-verbal feedback
    # non_verbal_analyzer = CommunicationAnalyzer()
    # non_verbal_feedback = await non_verbal_analyzer.analyze_communication(video_file)

    # print(non_verbal_feedback)

    result = await Database.save_video(video_data)

    vidUrl = result["url"]

    await Database.save_history(current_user['_id'], vidUrl, candidate_assess, question, quiz_id)

    #give dict of question:video and question:feedback to Database functions
    
    return {"url": vidUrl, "feedback": candidate_assess}


@router_record.get("/history")
async def get_history(
    current_user: dict = Depends(get_current_user)
):
    try:
        result = await Database.get_history(current_user['_id'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DownloadReportRequest(BaseModel):
    feedbackData: dict
    feedbacks: List[dict]

@router_record.post("/download_report")
async def download_report(
    request: DownloadReportRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        graph_from_gemini = get_graph_data(request.feedbacks)
        pdf_path = generate_feedback_report(request.feedbackData, graph_from_gemini, current_user["full_name"], "assessment_report.pdf")

        return FileResponse(
            path=pdf_path,
            filename="assessment_report.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    