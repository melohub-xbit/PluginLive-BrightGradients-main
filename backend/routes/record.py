from fastapi import APIRouter, Depends, File, UploadFile
from db.init_db import Database
from .auth import get_current_user

router_record = APIRouter()

from fastapi import APIRouter, Depends, File, UploadFile, Form
from db.init_db import Database
from .auth import get_current_user

router_record = APIRouter()

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
    print("Received video data:")
    result = await Database.save_video(video_data)
    print("Database save result:")
    return {"url": result["url"]}

