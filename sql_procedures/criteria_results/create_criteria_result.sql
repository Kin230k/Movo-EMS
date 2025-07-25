CREATE OR REPLACE PROCEDURE create_criterion_result(
    p_answer_id UUID,
    p_criterion_id UUID,
    p_passed BOOLEAN,
    p_evaluated_at TIMESTAMP
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO CRITERIA_RESULTS (
        criterionResultId,
        answerId, 
        criterionId, 
        passed, 
        evaluatedAt
    ) VALUES (
        gen_random_uuid(),
        p_answer_id,
        p_criterion_id,
        p_passed,
        p_evaluated_at
    ) ;
END;
$$;