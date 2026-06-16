import re
from typing import Dict, Optional

from fastapi import UploadFile
import httpx

from app.config import settings


class CloudinaryService:
    def __init__(self) -> None:
        self.cloud_name = settings.CLOUDINARY_CLOUD_NAME
        self.api_key = settings.CLOUDINARY_API_KEY
        self.api_secret = settings.CLOUDINARY_API_SECRET
        self.upload_preset = settings.CLOUDINARY_UPLOAD_PRESET
        self.upload_url = f"https://api.cloudinary.com/v1_1/{self.cloud_name}/image/upload"
        self.destroy_url = f"https://api.cloudinary.com/v1_1/{self.cloud_name}/image/destroy"

    def _validate_credentials(self) -> None:
        if not all([self.cloud_name, self.api_key, self.api_secret]):
            raise RuntimeError("Cloudinary environment variables are not configured.")

    async def upload_image(self, image: UploadFile) -> Dict[str, str]:
        self._validate_credentials()

        data = {}
        if self.upload_preset:
            data["upload_preset"] = self.upload_preset

        files = {"file": (image.filename, await image.read(), image.content_type)}

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                self.upload_url,
                data=data,
                files=files,
                auth=httpx.BasicAuth(self.api_key, self.api_secret),
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise RuntimeError(
                    f"Cloudinary upload failed ({exc.response.status_code}): {exc.response.text}"
                ) from exc

        payload: Dict = response.json()
        return {"secure_url": payload["secure_url"], "public_id": payload["public_id"]}

    async def delete_image(self, public_id: str) -> None:
        self._validate_credentials()

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                self.destroy_url,
                data={"public_id": public_id},
                auth=httpx.BasicAuth(self.api_key, self.api_secret),
            )
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise RuntimeError(
                    f"Cloudinary delete failed ({exc.response.status_code}): {exc.response.text}"
                ) from exc

    @staticmethod
    def get_public_id_from_url(url: str) -> Optional[str]:
        if not url:
            return None
        match = re.search(r"/upload/(?:v\d+/)?(.+?)\.[a-zA-Z0-9]+(?:$|\?)", url)
        return match.group(1) if match else None


cloudinary_service = CloudinaryService()
