CREATE OR REPLACE FUNCTION get_all_questions()
RETURNS TABLE (
    questionId UUID,
    typeCode VARCHAR(30),
    questionText VARCHAR(1000),
    formId UUID,
    interviewId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        q.questionId,
        q.typeCode,
        q.questionText,
        q.formId,
        q.interviewId
    FROM QUESTIONS q;
END;
$$;