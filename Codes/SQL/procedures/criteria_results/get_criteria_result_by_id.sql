CREATE OR REPLACE FUNCTION get_criterion_result_by_id(p_auth_user_id UUID,p_criterion_result_id UUID)
RETURNS TABLE (
    criterionResultId UUID,
    answerId UUID,
    criterionId UUID,
    passed BOOLEAN,
    evaluatedAt TIMESTAMP
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_criteria_result_by_id');

RETURN QUERY 
    SELECT 
        cr.criterionResultId,
        cr.answerId,
        cr.criterionId,
        cr.passed,
        cr.evaluatedAt
    FROM CRITERIA_RESULTS cr
    WHERE cr.criterionResultId = p_criterion_result_id;
END;
$$;