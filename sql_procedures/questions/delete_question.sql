CREATE OR REPLACE PROCEDURE delete_question(p_question_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM QUESTIONS
    WHERE questionId = p_question_id;
END;
$$;