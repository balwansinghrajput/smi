# run.py
import sys
import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    # Determine server behavior based on environment
    is_dev = settings.ENVIRONMENT == "development"
    is_windows = sys.platform.startswith("win")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=is_dev and not is_windows,               # Avoid reload subprocess issues on Windows
        workers=1,                                      # Single worker for stability on Windows and development
        log_level="info",
        proxy_headers=True,                             # Crucial if running behind Nginx/Traefik/Cloudflare
        forwarded_allow_ips="*",
    )
