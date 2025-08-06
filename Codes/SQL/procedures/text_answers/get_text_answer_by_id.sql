CREATE OR REPLACE FUNCTION get_text_answer_by_id(p_answer_id UUID)
RETURNS TABLE (answerId UUID, response TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ta.answerId,
        ta.response
    FROM TEXT_ANSWERS ta
    WHERE ta.answerId = p_answer_id;
END;
$$;