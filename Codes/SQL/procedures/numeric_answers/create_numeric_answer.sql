CREATE OR REPLACE PROCEDURE create_numeric_answer(
    IN p_answerId UUID,
    IN p_response NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validate response
    IF p_response IS NULL THEN
        RAISE EXCEPTION 'Response value cannot be NULL';
    END IF;

    INSERT INTO NUMERIC_ANSWERS (
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
            RAISE EXCEPTION 'Response value cannot be NULL';
END;
$$;