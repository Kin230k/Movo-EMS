CREATE OR REPLACE PROCEDURE update_text_answer(
    p_answer_id UUID,
    p_response TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE TEXT_ANSWERS
    SET response = p_response
    WHERE answerId = p_answer_id;
END;
$$;