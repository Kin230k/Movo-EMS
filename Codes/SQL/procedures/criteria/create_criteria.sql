CREATE OR REPLACE PROCEDURE create_criterion(p_auth_user_id UUID,
 p_type criteria_operator,
 p_value VARCHAR(255),
 p_question_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_criteria');

INSERT INTO CRITERIA (
 criterionId,
 type,
 value,
 questionId
 ) VALUES (
 gen_random_uuid(),
 p_type,
 p_value,
 p_question_id
 );
END;
$$;