CREATE OR REPLACE PROCEDURE update_rating_answer(
    p_answer_id UUID,
    p_rating SMALLINT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE RATING_ANSWERS
    SET rating = p_rating
    WHERE answerId = p_answer_id;
END;
$$;