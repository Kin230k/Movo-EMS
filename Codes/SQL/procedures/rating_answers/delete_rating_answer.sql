CREATE OR REPLACE PROCEDURE delete_rating_answer(p_answer_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM RATING_ANSWERS
    WHERE answerId = p_answer_id;
END;
$$;