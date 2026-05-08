import os
import django
import sys

# Setup django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from ai_services.groq_service import get_groq_response

def test_groq():
    print("--- Testing Identity ---")
    prompt = "Who made you?"
    response = get_groq_response(prompt)
    print(f"Prompt: {prompt}")
    print(f"Response: {response}")

    print("\n--- Testing Actual API Call ---")
    prompt = "What is green computing"
    # Testing streaming output since UI uses streaming
    try:
        from groq import Groq
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.75,
            stream=True,
        )
        print(f"Prompt: {prompt}")
        print(f"Response (stream simulation): ", end="")
        for chunk in completion:
            print(chunk.choices[0].delta.content, end="")
    except Exception as e:
        print(f"\n[RAW API ERROR]: {str(e)}")
    print()

if __name__ == "__main__":
    test_groq()
