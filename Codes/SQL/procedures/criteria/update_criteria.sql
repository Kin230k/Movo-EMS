CREATE OR REPLACE PROCEDURE update_criterion(p_auth_user_id UUID,
 p_criterion_id UUID,
 p_type criteria_operator DEFAULT NULL,
 p_value VARCHAR(255) DEFAULT NULL,
 p_question_id UUID DEFAULT NULL,
 p_effect criterion_effect
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_criterion');

UPDATE CRITERIA
 SET
 type = COALESCE(p_type, type),
 value = COALESCE(p_value, value),
 questionId = COALESCE(p_question_id, questionId)
 effect=p_effect
 WHERE criterionId = p_criterion_id;
END;
$$;