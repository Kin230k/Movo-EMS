CREATE OR REPLACE PROCEDURE create_criterion_result(p_auth_user_id UUID, 
    p_answer_id UUID,
    p_criterion_id UUID,
    p_passed BOOLEAN,
    p_evaluated_at TIMESTAMP
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_criteria_result');

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