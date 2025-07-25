CREATE OR REPLACE PROCEDURE create_option(
    p_option_text JSONB,
    p_question_id UUID,
    p_is_correct BOOLEAN,
    p_display_order INT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO OPTIONS (
        optionText, 
        questionId, 
        isCorrect, 
        displayOrder
    ) VALUES (
        p_option_text,
        p_question_id,
        p_is_correct,
        p_display_order
    ) RETURNING *;
END;
$$;