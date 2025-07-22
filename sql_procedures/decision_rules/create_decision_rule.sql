CREATE OR REPLACE PROCEDURE create_decision_rule(
    p_name VARCHAR(100),
    p_description TEXT,
    p_form_id UUID,
    p_priority INT,
    p_outcome_on_pass submission_outcome,
    p_outcome_on_fail submission_outcome
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO DECISION_RULES (
        name, 
        description, 
        formId, 
        priority, 
        outcomeOnPass, 
        outcomeOnFail
    ) VALUES (
        p_name,
        p_description,
        p_form_id,
        p_priority,
        p_outcome_on_pass,
        p_outcome_on_fail
    ) RETURNING *;
END;
$$;