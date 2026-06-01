import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Cloudinary if keys are provided
use_cloudinary = False
if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )
    use_cloudinary = True
    logger.info("Cloudinary configured successfully.")
else:
    logger.info("Cloudinary credentials missing. Falling back to local file storage.")

# Local upload directory setup
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "static", "uploads")

async def upload_image(file: UploadFile, folder: str = "goldenplace") -> str:
    """Uploads an image either to Cloudinary or locally. Returns the file URL."""
    if use_cloudinary:
        try:
            # Read file contents and upload to Cloudinary
            result = cloudinary.uploader.upload(file.file, folder=folder)
            return result.get("secure_url")
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}. Falling back to local storage.")
            # Fallthrough to local upload if Cloudinary fails
    
    # Local Storage Upload
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Reset file cursor and read
        file.file.seek(0)
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
            
        # Return local static URL
        return f"/static/uploads/{unique_filename}"
    except Exception as e:
        logger.error(f"Local upload failed: {e}")
        raise e

async def delete_image(image_url: str) -> bool:
    """Deletes an image from Cloudinary or local storage."""
    if not image_url:
        return False
        
    if use_cloudinary and "cloudinary.com" in image_url:
        try:
            # Extract public ID from URL
            # Example: https://res.cloudinary.com/demo/image/upload/v1570975200/sample.jpg
            parts = image_url.split("/")
            # Find the segment after 'upload' and remove version segment starting with 'v' if present
            upload_idx = -1
            for i, p in enumerate(parts):
                if p == "upload":
                    upload_idx = i
                    break
            if upload_idx != -1 and upload_idx + 1 < len(parts):
                path_parts = parts[upload_idx + 2:] if parts[upload_idx + 1].startswith("v") else parts[upload_idx + 1:]
                public_id_with_ext = "/".join(path_parts)
                public_id = os.path.splitext(public_id_with_ext)[0]
                cloudinary.uploader.destroy(public_id)
                return True
        except Exception as e:
            logger.error(f"Cloudinary delete failed: {e}")
            return False
            
    # Local storage delete
    if "/static/uploads/" in image_url:
        try:
            filename = image_url.split("/static/uploads/")[-1]
            file_path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
        except Exception as e:
            logger.error(f"Local file delete failed: {e}")
            return False
            
    return False
