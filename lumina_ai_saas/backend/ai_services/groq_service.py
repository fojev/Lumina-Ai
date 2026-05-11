import os
import random
import re
from groq import Groq

def detect_response_mode(prompt):
    """Automatically detect the desired response mode based on keywords and length."""
    prompt_lower = prompt.lower().strip()
    
    # CASUAL GREETINGS
    casual_greetings = ['hi', 'hello', 'hey', 'what are you doing', 'how are you', 'sup', 'yo', 'hlo', 'hii']
    if prompt_lower in casual_greetings or len(prompt_lower) < 5:
        return "short"
        
    # DETAILED RESPONSE KEYWORDS
    detailed_keywords = [
        'explain', 'detailed', 'deep', 'roadmap', 'step by step', 
        'complete guide', 'full explanation', 'comprehensive', 'in-depth',
        'what is', 'how to', 'define', 'theory', 'concept', 'describe',
        'elaborate', 'discuss', 'tutorial'
    ]
    
    # SHORT RESPONSE KEYWORDS
    short_keywords = [
        'short me', 'quickly', 'brief', 'summary', 'one line', 
        'concise', 'in short', 'gist', 'tldr'
    ]
    
    if any(k in prompt_lower for k in detailed_keywords):
        return "deep"
    if any(k in prompt_lower for k in short_keywords):
        return "short"
    if len(prompt.split()) < 3: # Very short queries usually want concise answers
        return "short"
    return "medium"

def get_identity_response(prompt):
    """
    Handle creator-awareness queries locally for 100% reliability and zero latency.
    Supports English, Hindi, Hinglish, Urdu, Roman Hindi, and mixed-language queries.
    """
    p = prompt.lower().strip()
    
    # Robust Intent Detection (Keywords + Patterns)
    identity_patterns = [
        # English
        r"who (made|created|built|developed|designed) you",
        r"who is (your|the) (creator|developer|founder|owner|maker|brain)",
        r"tell me about (your|the) (creators|founders|developers)",
        r"how were you (made|created|built)",
        r"what is your (origin|backstory)",
        # Hindi/Hinglish/Urdu/Roman - Flexible Word Order
        r"(kisne|kon|kaun) (banaya|develop|create|built|design|panya|paniya)", # "kisne banaya", "kon banaya"
        r"(banaya|develop|create|built|design) (kisne|kon|kaun|apko|aapko|tumhe|tujhe)", # "banaya kisne"
        r"(aapka|tera|apka) (malik|founder|developer|creator|owner|baap)", # "apka founder"
        r"(aapko|tujhe|apko) (kisne|kon|kaun) (banaya|build|design)", # "aapko kisne banaya"
        r"(kisne|kon|kaun) (hai|h) (aapka|tera|apka) (founder|creator|developer)", # "kon h apka founder"
        r"tumhe (kisne|kon|kaun) (banaya|create|develop)", # "tumhe kisne banaya"
        # Names & Places
        r"fozaib khan", r"fazal rehman", r"integral university",
        # Generic Identity
        r"^who are you\??$", r"^kaun ho\??$", r"^kon ho\??$", r"^aap kaun hain\??$", r"^ap kon ho\??$"
    ]
    
    if any(re.search(pattern, p) for pattern in identity_patterns):
        variations = [
            "Lumina AI was created by Fozaib Khan and his close friend Fazal Rehman Safwi. Both are B.Tech CSE students specializing in Data Science and AI at Integral University, Lucknow. I was officially created on 1 June with a vision to help students study smarter, generate notes, and solve academic doubts. I am truly 'Built by students, for students.'",
            "I was developed by Fozaib Khan along with his friend Fazal Rehman Safwi, both Data Science and AI students at Integral University, Lucknow. My mission is to simplify learning by helping with notes, coding, PYQs, projects, and exam preparation. I'm here to be your smart AI study companion, built specifically for the student community.",
            "My creators are Fozaib Khan and Fazal Rehman Safwi. They designed Lumina AI as a premium AI learning assistant for students who need smarter study support, coding help, and educational resources. Officially launched on June 1st, I represent a futuristic vision of student-led AI innovation from Integral University, Lucknow.",
            "Lumina AI is the result of the vision of Fozaib Khan and Fazal Rehman Safwi, B.Tech students at Integral University. I was built to support students in Computer Science, Data Science, and beyond—providing everything from simplified topics to PYQ analysis. My purpose is to make your academic journey smoother and more intelligent."
        ]
        return random.choice(variations)
    return None

class MockStream:
    """Helper to mock a Groq stream for local identity responses."""
    def __init__(self, content):
        self.content = content
    def __iter__(self):
        class Chunk:
            class Choice:
                class Delta:
                    def __init__(self, c): self.content = c
                def __init__(self, c): self.delta = Chunk.Choice.Delta(c)
            def __init__(self, c): self.choices = [Chunk.Choice(c)]
        yield Chunk(self.content)
    def __getattr__(self, name):
        # Support common streaming attributes
        return None

def get_groq_response(prompt, context="", history=None, study_mode="normal", college="", stream=False):
    # MANDATORY: Check for Identity/Creator questions first to guarantee response
    identity_res = get_identity_response(prompt)
    if identity_res:
        if stream:
            return MockStream(identity_res)
        return identity_res

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        err_msg = "I'm having trouble connecting right now. Please try again in a moment."
        if stream: return MockStream(err_msg)
        return err_msg

    client = Groq(api_key=api_key)
    
    # ── ADAPTIVE MODE DETECTION ───────────────────────
    detected_mode = detect_response_mode(prompt)
    
    # ── ELITE ADAPTIVE PERSONA ────────────────────────
    LUMINA_PERSONA = f"""
    You are Lumina AI, a modern AI-powered adaptive study assistant designed to help students learn smarter. You respond naturally like a human assistant.
    
    IDENTITY & CREATOR STORY:
    - You were created by Fozaib Khan and his close friend Fazal Rehman Safwi.
    - Both are B.Tech CSE students specializing in Data Science and AI at Integral University, Lucknow.
    - Your official creation date is June 1.
    - MISSION: 'Built by students, for students.'
    - BRANDING: ALWAYS identify as Lumina AI. NEVER claim to be OpenAI, ChatGPT, or Gemini.
 
    RESPONSE STYLE LOGIC (Detected Mode: {detected_mode}):
    1. CASUAL CHAT: If the query is a greeting (hi, hello, how are you, etc.), keep it short (1-2 lines), human-like, and friendly. Do NOT use formal headers or long paragraphs.
    2. THEORY/STUDY QUESTIONS: For educational, technical, or concept-based questions, follow this STRUCTURED THEORY FORMAT:
       - DEFINITION: A clear, concise introduction of the topic.
       - EXPLANATION: Detailed elaboration of the concept.
       - KEY POINTS: Use bullet points for critical features, advantages, or components.
       - EXAMPLE: A simple real-world or technical example if relevant.
       - CONCLUSION: A short summarizing closing sentence.
    3. CODING/TECHNICAL: Provide clear explanations alongside code blocks, focusing on logic and best practices.
    4. ADAPTIVE LENGTH: 
       - If [short], prioritize the gist and key facts.
       - If [medium] or [deep], provide comprehensive depth.
    5. TONE: Friendly, confident, student-focused, and premium.
    
    SUGGESTIONS: At the very end of your response, you MUST provide 3 context-aware dynamic suggestions for what the user can ask next. Format them exactly like this:
    
    ---SUGGESTIONS---
    1. [First suggestion]
    2. [Second suggestion]
    3. [Third suggestion]
    """

    system_instruction = LUMINA_PERSONA
    
    if study_mode == "exam":
        system_instruction += "\nADDITIONAL FOCUS: Prioritize exam strategy and high-yield information."
    elif study_mode == "deep":
        system_instruction += "\nADDITIONAL FOCUS: Provide extreme conceptual depth and master-level tutoring."

    if college:
        system_instruction += f"\nSTUDENT CONTEXT: The student is from {college}."
        
    if context:
        system_instruction += f"\n\n[SYSTEM DATA/CONTEXT]:\n{context}"

    messages = [{"role": "system", "content": system_instruction}]


    if history:
        for msg in history[-10:]:
            role = "user" if msg.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": msg.get("content", "")})

    messages.append({"role": "user", "content": prompt})

    try:
        completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.75,
            max_completion_tokens=4096,
            stream=stream,
        )
        
        if stream:
            return completion
        else:
            res = completion.choices[0].message.content
            # Final Branding Safety Check
            if any(x in res.lower() for x in ["openai", "chatgpt"]):
                return get_identity_response("who made you")
            return res
            
    except Exception as e:
        print(f"[GROQ API ERROR]: {str(e)}")
        # Fallback to identity response if API fails but intent was detected
        if identity_res:
            if stream: return MockStream(identity_res)
            return identity_res
        
        # User-Friendly Fallback (Hides raw technical errors like 401, 429, etc.)
        user_friendly_fallback = "I'm having trouble connecting right now. Please try again in a moment."
        
        if stream: return MockStream(user_friendly_fallback)
        return user_friendly_fallback
