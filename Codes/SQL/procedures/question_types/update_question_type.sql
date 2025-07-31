CREATE OR REPLACE PROCEDURE update_question_type(
    p_type_code VARCHAR(30),
    p_description JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE QUESTION_TYPES
    SET description = p_description
    WHERE typeCode = p_type_code;
END;
$$;