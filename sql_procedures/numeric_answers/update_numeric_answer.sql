CREATE OR REPLACE PROCEDURE update_numeric_answer(
    p_answer_id UUID,
    p_response NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE NUMERIC_ANSWERS
    SET response = p_response
    WHERE answerId = p_answer_id;
END;
$$;