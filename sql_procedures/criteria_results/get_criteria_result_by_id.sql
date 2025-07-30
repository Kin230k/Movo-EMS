CREATE OR REPLACE FUNCTION get_criterion_result_by_id(p_criterion_result_id UUID)
RETURNS TABLE (
    criterionResultId UUID,
    answerId UUID,
    criterionId UUID,
    passed BOOLEAN,
    evaluatedAt TIMESTAMP
) LANGUAGE plpgsql AS $$
BEGIN
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