CREATE OR REPLACE PROCEDURE delete_numeric_answer(p_answer_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM NUMERIC_ANSWERS
    WHERE answerId = p_answer_id;
END;
$$;