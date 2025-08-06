CREATE OR REPLACE FUNCTION get_all_criterion_results()
RETURNS TABLE (
    criterionResultId UUID,
    answerId UUID,
    criterionId UUID,
    passed BOOLEAN,
    evaluatedAt TIMESTAMP
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_criteria_results');

RETURN QUERY 
    SELECT 
        cr.criterionResultId,
        cr.answerId,
        cr.criterionId,
        cr.passed,
        cr.evaluatedAt
    FROM CRITERIA_RESULTS cr;
END;
$$;