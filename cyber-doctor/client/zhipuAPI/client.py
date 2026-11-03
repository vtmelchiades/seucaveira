from zhipuai import ZhipuAI
from env import get_env_value


def _build_client(env_key):
    """LAZY-GUARD (local install patch): the original module built all three
    ZhipuAI clients at import time and zhipuai raises when the api key is empty,
    which made `python app.py` crash before the UI could start. Build them only
    when a key is configured; the tool functions report a clear error otherwise.
    """
    api_key = get_env_value(env_key)
    if not api_key:
        print(f"[cyber-doctor] {env_key} is not configured; that feature is disabled.")
        return None
    return ZhipuAI(api_key=api_key)


Image_generate_client = _build_client("IMAGE_GENERATE_API")
Image_describe_client = _build_client("IMAGE_DESCRIBE_API")
Video_generate_client = _build_client("VIDEO_GENERATE_API")
