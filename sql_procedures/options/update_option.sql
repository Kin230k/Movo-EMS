CREATE OR REPLACE PROCEDURE update_option(
    p_option_id UUID,
    p_option_text VARCHAR(500),
    p_question_id UUID,
    p_is_correct BOOLEAN,
    p_display_order INT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE OPTIONS
    SET 
        optionText = p_option_text,
        questionId = p_question_id,
        isCorrect = p_is_correct,
        displayOrder = p_display_order
    WHERE optionId = p_option_id;
END;
$$;