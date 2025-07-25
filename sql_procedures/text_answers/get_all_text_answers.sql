CREATE OR REPLACE FUNCTION get_all_text_answers()
RETURNS TABLE (answerId UUID, response TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ta.answerId,
        ta.response
    FROM TEXT_ANSWERS ta;
END;
$$;