from django.db import models

class College(models.Model):
    name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, null=True)
    semester = models.IntegerField(help_text="Semester number (1-8)")
    branch = models.CharField(max_length=255, blank=True, null=True, help_text="e.g. Computer Science")
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)

    class Meta:
        unique_together = ('name', 'semester')

    def __str__(self):
        return f"{self.name} (Sem {self.semester})"

class QuestionPaper(models.Model):
    EXAM_TYPES = [
        ('mid1', 'Midsem 1'),
        ('mid2', 'Midsem 2'),
        ('semester', 'Semester'),
    ]
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='question_papers')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='question_papers')
    exam_type = models.CharField(max_length=20, choices=EXAM_TYPES)
    year = models.IntegerField()
    uploaded_pdf = models.FileField(upload_to='question_papers/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.college.name} - {self.subject.name} ({self.get_exam_type_display()} {self.year})"

class Question(models.Model):
    question_paper = models.ForeignKey(QuestionPaper, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    marks = models.IntegerField(null=True, blank=True)
    topic_tags = models.CharField(max_length=255, blank=True, help_text="Comma separated topics")

    def __str__(self):
        return f"Q: {self.question_text[:50]}..."
