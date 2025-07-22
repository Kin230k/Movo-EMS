CREATE OR REPLACE PROCEDURE create_criterion(
    p_type criteria_operator,
    p_value VARCHAR(255),
    p_question_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO CRITERIA (
        type, 
        value, 
        questionId
    ) VALUES (
        p_type,
        p_value,
        p_question_id
    ) RETURNING *;
END;
$$;