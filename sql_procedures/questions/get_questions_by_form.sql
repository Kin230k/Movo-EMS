CREATE OR REPLACE FUNCTION get_questions_by_form(p_form_id UUID)
RETURNS TABLE (
    questionId UUID,
    typeCode VARCHAR(30),
    questionText VARCHAR(1000)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        q.questionId,
        q.typeCode,
        q.questionText
    FROM QUESTIONS q
    WHERE q.formId = p_form_id;
END;
$$;