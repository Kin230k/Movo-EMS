CREATE OR REPLACE PROCEDURE delete_text_answer(p_answer_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM TEXT_ANSWERS
    WHERE answerId = p_answer_id;
END;
$$;