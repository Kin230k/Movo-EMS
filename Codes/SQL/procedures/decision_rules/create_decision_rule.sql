CREATE OR REPLACE PROCEDURE create_decision_rule(p_auth_user_id UUID,
 p_name JSONB,
 p_description JSONB,
 p_form_id UUID,
 p_priority INT,
 p_outcome_on_pass submission_outcome
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_decision_rule');

INSERT INTO DECISION_RULES (
 ruleId,
 name,
 description,
 formId,
 priority,
 outcomeOnPass
 ) VALUES (
 gen_random_uuid(),
 p_name,
 p_description,
 p_form_id,
 p_priority,
 p_outcome_on_pass
 );
END;
$$;