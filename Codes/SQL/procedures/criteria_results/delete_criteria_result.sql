CREATE OR REPLACE PROCEDURE delete_criterion_result(p_auth_user_id UUID, p_criterion_result_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_criteria_result');

DELETE FROM CRITERIA_RESULTS
    WHERE criterionResultId = p_criterion_result_id;
END;
$$;