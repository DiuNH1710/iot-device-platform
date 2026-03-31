import logging

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)


def send_telegram_message(message: str) -> bool:
    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
    }

    try:
        response = httpx.post(url, json=payload, timeout=10.0)
        if response.status_code != 200:
            logger.error(
                "Failed to send telegram message: status=%s body=%s",
                response.status_code,
                response.text,
            )
            return False

        body = response.json()
        if not body.get("ok", False):
            logger.error("Telegram API error response: %s", body)
            return False

        return True
    except Exception as exc:
        logger.exception("Exception while sending telegram message: %s", exc)
        return False
