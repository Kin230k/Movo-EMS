CREATE OR REPLACE PROCEDURE create_decision_rule(
    p_name JSONB,
    p_description JSONB,
    p_form_id UUID,
    p_priority INT,
    p_outcome_on_pass submission_outcome,
   
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO DECISION_RULES (
        name, 
        description, 
        formId, 
        priority, 
        outcomeOnPass
    ) VALUES (
        p_name,
        p_description,
        p_form_id,
        p_priority,
        p_outcome_on_pass
    ) RETURNING *;
END;
$$;