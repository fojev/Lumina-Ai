import pdfplumber
import re
from intelligence.models import Question

def extract_questions_from_pdf(question_paper):
    """
    Extracts text from a QuestionPaper PDF, identifies questions using regex,
    and saves them to the Question database model.
    """
    try:
        pdf_path = question_paper.uploaded_pdf.path
    except ValueError:
        # No file attached
        return 0
        
    full_text = ""
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return 0

    # Robust regex to find questions
    # Matches patterns like "1. ", "Q1. ", "Question 1:", "(a) " at the start of a line
    pattern = r"(?:^|\n)\s*(?:Q\s*\d+\.?|Question\s*\d+:?|\d+[a-zA-Z]?\.\s*|\([a-zA-Z]\)\s*)(.*?)(?=(?:^|\n)\s*(?:Q\s*\d+\.?|Question\s*\d+:?|\d+[a-zA-Z]?\.\s*|\([a-zA-Z]\)\s*)|\Z)"
    
    matches = re.finditer(pattern, full_text, re.IGNORECASE | re.DOTALL)
    
    questions_to_create = []
    
    # Marks regex e.g. [5], (5 Marks), [5M]
    marks_pattern = r"[\[\(]\s*(\d+)\s*(?:Marks|M|m)?\s*[\]\)]"

    for match in matches:
        q_text = match.group(1).strip()
        if len(q_text) < 10:  # Too short to be a valid question
            continue
            
        # Clean up newlines in question text
        q_text = re.sub(r'\s+', ' ', q_text).strip()
        
        # Try to extract marks
        marks = None
        marks_match = re.search(marks_pattern, q_text, re.IGNORECASE)
        if marks_match:
            try:
                marks = int(marks_match.group(1))
                # Remove marks from the question text itself to clean it up
                q_text = re.sub(marks_pattern, '', q_text, flags=re.IGNORECASE).strip()
            except ValueError:
                pass
                
        questions_to_create.append(Question(
            question_paper=question_paper,
            question_text=q_text,
            marks=marks
        ))
        
    # Bulk create the questions
    if questions_to_create:
        Question.objects.bulk_create(questions_to_create)
        
    question_paper.is_processed = True
    question_paper.save()
    
    return len(questions_to_create)
