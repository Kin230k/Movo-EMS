CREATE OR REPLACE PROCEDURE delete_answer_option(p_answer_options_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ANSWER_OPTIONS
    WHERE answerOptionsId = p_answer_options_id;
END;
$$;