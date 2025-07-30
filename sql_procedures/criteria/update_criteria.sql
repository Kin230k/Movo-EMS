CREATE OR REPLACE PROCEDURE update_criterion(
    p_criterion_id UUID,
    p_type criteria_operator,
    p_value VARCHAR(255),
    p_question_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE CRITERIA
    SET 
        type = p_type,
        value = p_value,
        questionId = p_question_id
    WHERE criterionId = p_criterion_id;
END;
$$;