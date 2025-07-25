CREATE OR REPLACE PROCEDURE update_criterion_result(
    p_criterion_result_id UUID,
    p_answer_id UUID,
    p_criterion_id UUID,
    p_passed BOOLEAN,
    p_evaluated_at TIMESTAMP
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE CRITERIA_RESULTS
    SET 
        answerId = p_answer_id,
        criterionId = p_criterion_id,
        passed = p_passed,
        evaluatedAt = p_evaluated_at
    WHERE criterionResultId = p_criterion_result_id;
END;
$$;