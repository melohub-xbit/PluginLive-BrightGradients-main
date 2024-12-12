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
    system_prompt = """Role: You are a communication coach designing engaging and insightful questions to assess and enhance people's speaking abilities.

Objective: Develop 5 thought-provoking questions for a casual yet professional conversation that assess communication skills while encouraging self-reflection and depth.  Focus on questions that reveal the candidate's ability to articulate clearly, think critically, and engage naturally.  Avoid hypothetical scenarios or overly complex situations.

Guidelines for the Questions:
* Focus on real experiences and personal reflections.
* Encourage storytelling and detailed responses.
* Assess clarity of thought, articulation, and engagement.
* Maintain a balance between light and thought-provoking.

Questions:
1. Tell me about a recent accomplishment you're proud of.
2. What's a topic you're passionate about and why?
3. Describe a time you had to explain something complex to someone unfamiliar with the subject.
4. What's a skill you're currently working on improving, and how are you approaching it?
5.  Tell me about a time you received constructive feedback. How did you respond?


Outcome of Responses
Gain insights into the candidate's ability to organize thoughts, articulate clearly, and connect with an audience.
Evaluate their communication style, critical thinking, and ability to reflect on personal experiences.
"""

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
    feedbackWithQuestions: List[dict]
    currentQuizId: str

@router_record.post("/final-feedback")
async def final_feedback(
    request: FinalFeedbackRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        response = get_final_summary(feedbacks=request.feedbackWithQuestions)
        await Database.save_final_feedbacks(response, current_user["_id"], request.currentQuizId)
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

@router_record.get("/final-feedbacks")
async def get_final_feedbacks(
    current_user: dict = Depends(get_current_user)
):
    try:
        result = await Database.get_final_feedbacks(current_user['_id'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DownloadReportRequest(BaseModel):
    feedbackData: dict
    feedbacks: List[dict]
    questions: List[str]

@router_record.post("/download_report")
async def download_report(
    request: DownloadReportRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        graph_from_gemini = get_graph_data(request.feedbacks)
        pdf_path = generate_feedback_report(request.feedbackData, request.feedbacks, request.questions, graph_from_gemini, current_user["full_name"], "assessment_report.pdf")

        return FileResponse(
            path=pdf_path,
            filename="assessment_report.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    