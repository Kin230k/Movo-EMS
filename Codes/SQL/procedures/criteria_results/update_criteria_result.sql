CREATE OR REPLACE PROCEDURE update_criterion_result(p_auth_user_id UUID,
 p_criterion_result_id UUID,
 p_answer_id UUID DEFAULT NULL,
 p_criterion_id UUID DEFAULT NULL,
 p_passed BOOLEAN DEFAULT NULL,
 p_evaluated_at TIMESTAMP DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_criteria_result');

UPDATE CRITERIA_RESULTS
 SET
 answerId = COALESCE(p_answer_id, answerId),
 criterionId = COALESCE(p_criterion_id, criterionId),
 passed = COALESCE(p_passed, passed),
 evaluatedAt = COALESCE(p_evaluated_at, evaluatedAt)
 WHERE criterionResultId = p_criterion_result_id;
END;
$$;