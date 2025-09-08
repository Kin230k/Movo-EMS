CREATE OR REPLACE PROCEDURE create_criterion(p_auth_user_id UUID,
 p_type criteria_operator,
 p_value VARCHAR(255),
 p_question_id UUID,
 p_effect criterion_effect
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_criterion');

INSERT INTO CRITERIA (
 criterionId,
 type,
 value,
 questionId,
 effect
 ) VALUES (
 gen_random_uuid(),
 p_type,
 p_value,
 p_question_id,
 p_effect
 );
END;
$$;