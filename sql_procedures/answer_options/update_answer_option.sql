CREATE OR REPLACE PROCEDURE update_answer_option(
    p_answer_options_id UUID,
    p_answer_id UUID,
    p_option_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ANSWER_OPTIONS
    SET 
        answerId = p_answer_id,
        optionId = p_option_id
    WHERE answerOptionsId = p_answer_options_id;
END;
$$;