import os
import django
import sys

# Setup django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from ai_services.groq_service import get_groq_response

def test_groq():
    print("Testing Groq Service...")
    prompt = "Explain Newton's first law in one sentence."
    response = get_groq_response(prompt, study_mode="exam")
    print(f"Prompt: {prompt}")
    print(f"Response: {response}")

if __name__ == "__main__":
    test_groq()
