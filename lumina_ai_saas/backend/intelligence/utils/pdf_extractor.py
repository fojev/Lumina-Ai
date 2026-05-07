import fitz  # PyMuPDF
import re
from ..models import Question

def extract_questions_from_paper(paper_obj):
    """
    Extracts text from the PDF of a QuestionPaper and identifies individual questions.
    """
    if not paper_obj.uploaded_pdf:
        return
    
    try:
        # Open PDF
        doc = fitz.open(paper_obj.uploaded_pdf.path)
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        
        doc.close()
        
        # Pattern detection for questions
        # Matches: Q1, Question 1, 1., 2. (a), etc.
        patterns = [
            r'(?:^|\n)\s*(?:Q|Question)\s*(\d+)',  # Q1, Question 1
            r'(?:^|\n)\s*(\d+)\.',                 # 1.
            r'(?:^|\n)\s*(\d+)\s*[\)\]]',          # 1) or 1]
        ]
        
        # Combine patterns
        combined_pattern = '|'.join(patterns)
        
        # Split text by question headers
        # We use re.split but keeping the delimiters is tricky.
        # Let's find all matches and their indices.
        matches = list(re.finditer(combined_pattern, full_text, re.IGNORECASE))
        
        questions = []
        for i in range(len(matches)):
            start = matches[i].start()
            end = matches[i+1].start() if i+1 < len(matches) else len(full_text)
            
            q_content = full_text[start:end].strip()
            if q_content:
                questions.append(q_content)
        
        # If no questions found by regex, fallback to splitting by double newline
        if not questions:
            questions = [q.strip() for q in full_text.split('\n\n') if len(q.strip()) > 20]

        # Save to database
        # Avoid duplicates for the same paper
        existing_count = paper_obj.questions.count()
        if existing_count == 0:
            for q_text in questions:
                Question.objects.create(
                    question_paper=paper_obj,
                    question_text=q_text
                )
            
            paper_obj.is_processed = True
            paper_obj.save()
            return True
            
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return False
