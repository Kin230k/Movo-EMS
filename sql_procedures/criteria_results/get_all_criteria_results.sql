CREATE OR REPLACE FUNCTION get_all_criterion_results()
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
    FROM CRITERIA_RESULTS cr;
END;
$$;