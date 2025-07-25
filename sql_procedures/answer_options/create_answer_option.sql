CREATE OR REPLACE PROCEDURE create_answer_option(
    p_answer_id UUID,
    p_option_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ANSWER_OPTIONS (
        answerId, 
        optionId
    ) VALUES (
        p_answer_id,
        p_option_id
    ) RETURNING *;
END;
$$;