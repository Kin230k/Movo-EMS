CREATE OR REPLACE PROCEDURE create_text_answer(
    IN p_answerId UUID,
    IN p_response TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate response first
    IF p_response IS NULL OR TRIM(p_response) = '' THEN
        RAISE EXCEPTION 'Response cannot be empty';
    END IF;

    -- Insert into TEXT_ANSWERS
    INSERT INTO TEXT_ANSWERS (
        answerId,
        response
    ) VALUES (
        p_answerId,
        p_response
    );
    
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'Invalid answerId: % does not exist in ANSWERS table', p_answerId;
        WHEN not_null_violation THEN
            RAISE EXCEPTION 'Response cannot be NULL';
END;
$$;