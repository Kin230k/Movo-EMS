CREATE OR REPLACE FUNCTION get_criterion_by_id(p_auth_user_id UUID,p_criterion_id UUID)
RETURNS TABLE (
    criterionId UUID,
    type criteria_operator,
    value VARCHAR(255),
    questionId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_criteria_by_id');

RETURN QUERY 
    SELECT 
        c.criterionId,
        c.type::criteria_operator,
        c.value,
        c.questionId
    FROM CRITERIA c
    WHERE c.criterionId = p_criterion_id;
END;