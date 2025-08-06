CREATE OR REPLACE PROCEDURE update_text_answer(
    p_answer_id UUID,
    p_response TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Validate response
    IF p_response IS NULL OR TRIM(p_response) = '' THEN
        RAISE EXCEPTION 'Response cannot be empty';
    END IF;

    UPDATE TEXT_ANSWERS
    SET response = p_response
    WHERE answerId = p_answer_id;
END;
$$;