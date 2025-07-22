CREATE OR REPLACE PROCEDURE create_question_type(
    p_description VARCHAR(255)
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO QUESTION_TYPES (description) 
    VALUES (p_description) 
    RETURNING *;
END;
$$;