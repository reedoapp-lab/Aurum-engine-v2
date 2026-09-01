import os
import json
import re
from pathlib import Path
from dotenv import load_dotenv
from huggingface_hub import InferenceClient
from schemas import NoticeExtraction

# Load .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

def get_client():
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        raise ValueError(
            "HF_TOKEN environment variable is not configured. "
            "Please set your HF_TOKEN in the Settings / environment to execute live Qwen2.5-VL neural document extraction."
        )
    return InferenceClient(
        model="Qwen/Qwen2.5-VL-72B-Instruct",
        token=hf_token
    )

def extract_notice_data(base64_images: list[str]) -> NoticeExtraction:
    client = get_client()
    # Build the vision content payload
    content_payload = []
    
    for b64 in base64_images:
        content_payload.append({
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
        })

    # Schema definition passed directly into system instructions
    schema_json = json.dumps(NoticeExtraction.model_json_schema(), indent=2)

    prompt = f"""You are an institutional alternative asset fund controller.
Extract all capital call financial figures, dates, and wire coordinates from the provided document image(s).

You MUST output ONLY a valid JSON object strictly matching this schema:
{schema_json}

Rules:
- Return all monetary numbers as numeric raw decimals (e.g., 250000.00).
- If a field is missing, use default 0.0 for fees/expenses or null.
- Do NOT wrap your output in markdown codeblocks (no ```json). Output raw JSON only."""

    content_payload.append({
        "type": "text",
        "text": prompt
    })

    messages = [
        {
            "role": "user",
            "content": content_payload
        }
    ]

    response = client.chat_completion(
        messages=messages,
        max_tokens=2048,
        temperature=0.01
    )

    raw_text = response.choices[0].message.content.strip()

    # Clean potential markdown fences if returned
    if raw_text.startswith("```"):
        raw_text = re.sub(r"^```[a-zA-Z]*\n", "", raw_text)
        raw_text = re.sub(r"\n```$", "", raw_text).strip()

    return NoticeExtraction.model_validate_json(raw_text)