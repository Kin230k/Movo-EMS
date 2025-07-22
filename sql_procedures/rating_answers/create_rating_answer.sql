CREATE OR REPLACE PROCEDURE create_rating_answer(p_rating SMALLINT)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO RATING_ANSWERS (rating) 
    VALUES (p_rating) 
    RETURNING *;
END;
$$;