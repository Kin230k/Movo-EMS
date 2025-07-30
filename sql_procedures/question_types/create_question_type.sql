CREATE OR REPLACE PROCEDURE create_question_type(
    IN p_typeCode VARCHAR(30),
    IN p_description JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Attempt to insert new question type
    INSERT INTO QUESTION_TYPES (
        typeCode,
        description
    ) VALUES (
        p_typeCode,
        p_description
    );

    -- Handle potential errors
    EXCEPTION
        WHEN unique_violation THEN
            RAISE EXCEPTION 'Question type "%" already exists', p_typeCode;
        WHEN not_null_violation THEN
            RAISE EXCEPTION 'Description cannot be NULL';
END;
$$;