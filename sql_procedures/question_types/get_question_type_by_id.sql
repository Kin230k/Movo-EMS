CREATE OR REPLACE FUNCTION get_question_type_by_id(p_type_code VARCHAR(30))
RETURNS TABLE (typeCode VARCHAR(30), description JSONB)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        qt.typeCode,
        qt.description
    FROM QUESTION_TYPES qt
    WHERE qt.typeCode = p_type_code;
END;
$$;