import logging

logger = logging.getLogger("admin_backend")
logging.basicConfig(
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    level=logging.INFO,
)


def log_info(message: str, **extra):
    logger.info(message, extra=extra)


def log_warning(message: str, **extra):
    logger.warning(message, extra=extra)


def log_error(message: str, **extra):
    logger.error(message, extra=extra)
