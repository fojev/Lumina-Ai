from django.contrib import admin
from .models import College, Subject, QuestionPaper, Question

@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')
    search_fields = ('name',)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'semester', 'code')
    list_filter = ('semester',)
    search_fields = ('name', 'code')

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

@admin.register(QuestionPaper)
class QuestionPaperAdmin(admin.ModelAdmin):
    list_display = ('subject', 'college', 'exam_type', 'year', 'is_processed')
    list_filter = ('exam_type', 'year', 'college', 'is_processed')
    search_fields = ('subject__name', 'college__name')
    inlines = [QuestionInline]
    actions = ['process_papers']

    def process_papers(self, request, queryset):
        # This will be linked to AGENT 2 logic
        from .utils.pdf_extractor import extract_questions_from_paper
        for paper in queryset:
            extract_questions_from_paper(paper)
        self.message_user(request, "Selected papers processed successfully.")
    process_papers.short_description = "Extract questions from PDFs"

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text_short', 'question_paper', 'marks')
    list_filter = ('question_paper__exam_type', 'question_paper__year')
    search_fields = ('question_text', 'topic_tags')

    def question_text_short(self, obj):
        return obj.question_text[:100]
    question_text_short.short_description = 'Question Text'
