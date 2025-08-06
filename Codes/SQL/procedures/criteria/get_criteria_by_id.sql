CREATE OR REPLACE FUNCTION get_criterion_by_id(p_criterion_id UUID)
RETURNS TABLE (
    criterionId UUID,
    type criteria_operator,
    value VARCHAR(255),
    questionId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        c.criterionId,
        c.type,
        c.value,
        c.questionId
    FROM CRITERIA c
    WHERE c.criterionId = p_criterion_id;
END;
$$;