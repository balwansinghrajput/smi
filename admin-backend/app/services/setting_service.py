from typing import Any, Dict

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.schemas.setting import SettingUpdateRequest, SettingResponse
from app.models.setting import SettingDocument


class SettingService:
    COLLECTION_NAME = "settings"
    SETTING_DOC_ID = "main_settings" # Use a fixed string ID for the singleton document

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    def _normalize_setting_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        if document is None:
            return document
        return document

    async def get_settings(self) -> SettingResponse:
        # Check if settings exist, if not create default
        setting = await self.db[self.COLLECTION_NAME].find_one({"_id": self.SETTING_DOC_ID})
        if not setting:
            default_setting = SettingDocument().dict()
            default_setting["_id"] = self.SETTING_DOC_ID
            await self.db[self.COLLECTION_NAME].insert_one(default_setting)
            setting = default_setting

        setting["_id"] = str(setting["_id"])
        return SettingResponse(**self._normalize_setting_document(setting))

    async def update_settings(self, payload: SettingUpdateRequest) -> SettingResponse:
        # Ensure setting exists first
        await self.get_settings()
        
        update_data = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
        
        if update_data:
            await self.db[self.COLLECTION_NAME].update_one(
                {"_id": self.SETTING_DOC_ID},
                {"$set": update_data}
            )
            
        updated = await self.db[self.COLLECTION_NAME].find_one({"_id": self.SETTING_DOC_ID})
        updated["_id"] = str(updated["_id"])
        return SettingResponse(**self._normalize_setting_document(updated))
