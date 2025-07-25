CREATE OR REPLACE PROCEDURE create_rating_answer(
    IN p_answerId UUID,
    IN p_rating SMALLINT
)
LANGUAGE plpgsql
AS $$
BEGIN

    -- Insert into RATING_ANSWERS
    INSERT INTO RATING_ANSWERS (
        answerId,
        rating
    ) VALUES (
        p_answerId,
        p_rating
    );
    
    EXCEPTION
        WHEN foreign_key_violation THEN
            RAISE EXCEPTION 'Invalid answerId: % does not exist in ANSWERS table', p_answerId;
END;
$$;
