import os
from groq import Groq

def get_groq_response(prompt, context="", history=None, study_mode="normal", college=""):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return "Groq API key is not configured."

    client = Groq(api_key=api_key)

    # ── ELITE TUTOR PERSONA (DEEP KNOWLEDGE) ──────────
    LUMINA_PERSONA = """
    You are Lumina AI, a smart, deeply knowledgeable, and human-like AI assistant.
    Your main job is to answer user questions in a detailed, clear, and intelligent way like ChatGPT or Gemini.

    ANSWER STYLE RULES:
    1. Give deep, detailed, and accurate explanations. Do not give shallow answers unless asked.
    2. Explain concepts step by step in simple, conversational language. Feel like a smart tutor.
    3. Use examples, logic, and clarification. First explain clearly, then add examples, then a summary.
    4. formatting: Small paragraphs, clean spacing. Use **bold** for important keywords only.
    5. Avoid robotic textbook tone. Use natural, supportive language.
    6. If educational/technical: Be accurate, step-by-step, and explain from beginner level.
    """

    system_instruction = LUMINA_PERSONA
    
    if study_mode == "exam":
        system_instruction += "\nFocus slightly more on exam strategy and direct impact."
    elif study_mode == "deep":
        system_instruction += "\nFocus on master-level tutoring and conceptual depth."

    if college:
        system_instruction += f"\nThe student is from {college}. Personalize naturally without being repetitive."
        
    if context:
        system_instruction += f"\n\n[SYSTEM DATA/CONTEXT]:\n{context}\n(Use this only if relevant or asked. Stay conversational.)"

    messages = [{"role": "system", "content": system_instruction}]

    # Build conversation history for context
    if history:
        for msg in history[-8:]:  # last 8 messages for context window
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})

    # Append current user message
    messages.append({"role": "user", "content": prompt})

    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_completion_tokens=2048,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Error connecting to AI service: {str(e)}"
