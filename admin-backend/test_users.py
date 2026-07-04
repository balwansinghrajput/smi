import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.services.user_service import UserService

async def main():
    client = AsyncIOMotorClient("mongodb+srv://balwansinghrajput:170800@balwan.z0uitca.mongodb.net/")
    db = client["smi"]
    service = UserService(db)
    try:
        page_data = await service.list_users(page=1, page_size=10)
        print("Success:", page_data.dict())
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
