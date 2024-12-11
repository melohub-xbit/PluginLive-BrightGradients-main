from motor.motor_asyncio import AsyncIOMotorClient
from decouple import config
from datetime import datetime
from passlib.context import CryptContext
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import time

MONGO_URL = config('MONGO_URL')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


#cloudinary config
cloudinary.config(
    cloud_name = config('CLOUDINARY_CLOUD_NAME'),
    api_key = config('CLOUDINARY_API_KEY'),
    api_secret = config('CLOUDINARY_API_SECRET'),
    secure = True
)

class Database:
    client: AsyncIOMotorClient = None
    user_collection = None

    @classmethod
    async def connect_db(cls):
        cls.client = AsyncIOMotorClient(MONGO_URL)
        cls.user_collection = cls.client.commsense.users
        await cls.user_collection.create_index("email", unique=True)
        await cls.user_collection.create_index("username", unique=True)

    @classmethod
    async def close_db(cls):
        cls.client.close()

    @classmethod
    async def save_user(cls, user_data: dict):
        user_data["password"] = pwd_context.hash(user_data["password"])
        user_data["created_at"] = datetime.utcnow()
        await cls.user_collection.insert_one(user_data)

    @classmethod
    async def get_user(cls, email: str):
        return await cls.user_collection.find_one({"email": email})
    
    @classmethod
    async def get_user_by_username(cls, username: str):
        return await cls.user_collection.find_one({"username": username})


    @classmethod
    def verify_password(cls, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)
    
    @classmethod
    def add_empty_dict(cls, username:str):
        user_dict = {}
        cls.user_collection.update_one(
            {"username": username},
            {"$set": {"answers": {}}}
        )
        cls.user_collection.update_one(
            {"username": username},
            {"$set": {"feedbacks": {}}}
        )

    @classmethod
    async def save_video(cls, video_data: dict):
        try:
            timestamp = int(time.time())
            # Upload to Cloudinary using the file content directly from the dict
            upload_result = cloudinary.uploader.upload(
                file=video_data['file'],  # Access the file content directly from dict
                resource_type="video",
                folder="user_recordings",
                timestamp=timestamp,
                transformation={"quality": "auto"}
            )

            # Create video document with user association
            video_document = {
                "user_id": video_data["user_id"],
                "cloudinary_id": upload_result["public_id"],
                "url": upload_result["secure_url"],
                "created_at": datetime.utcnow(),
                "duration": upload_result.get("duration", 0),
                "format": upload_result.get("format", "webm")
            }

            # Save to MongoDB
            await cls.client.commsense.videos.insert_one(video_document)
            return video_document
        except Exception as e:
            print(f"Upload error: {str(e)}")
            raise e



