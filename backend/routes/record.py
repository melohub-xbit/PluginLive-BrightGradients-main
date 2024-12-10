from fastapi import APIRouter, Depends
from db.init_db import Database
from .auth import get_current_user

router_record = APIRouter()

@router_record.post("/save-video")
async def save_video(video_data: dict, current_user: dict = Depends(get_current_user)):
    # print(f"Video data: {video_data}")
    video_data["user_id"] = str(current_user["_id"])
    await Database.save_video(video_data)
    return {"message": "Video saved successfully"}
