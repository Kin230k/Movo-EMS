CREATE OR REPLACE PROCEDURE create_criterion(
    p_type criteria_operator,
    p_value VARCHAR(255),
    p_question_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO CRITERIA (
        criterionId,
        type, 
        value, 
        questionId
    ) VALUES (
        gen_random_uuid(),
        p_type,
        p_value,
        p_question_id
    ) ;
END;
$$;