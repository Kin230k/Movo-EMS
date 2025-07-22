CREATE OR REPLACE PROCEDURE delete_answer(p_answer_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ANSWERS
    WHERE answerId = p_answer_id;
END;
$$;