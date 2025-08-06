CREATE OR REPLACE PROCEDURE update_question_type(p_auth_user_id UUID, 
    p_type_code VARCHAR(30),
    p_description JSONB DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_question_type');

UPDATE QUESTION_TYPES
    SET description = COALESCE(p_description, description)
    WHERE typeCode = p_type_code;
END;
$$;