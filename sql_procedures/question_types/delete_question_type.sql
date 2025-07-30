CREATE OR REPLACE PROCEDURE delete_question_type(p_type_code VARCHAR(30))
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM QUESTION_TYPES
    WHERE typeCode = p_type_code;
END;
$$;