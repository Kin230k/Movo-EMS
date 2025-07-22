CREATE OR REPLACE PROCEDURE create_text_answer(p_response TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO TEXT_ANSWERS (response) 
    VALUES (p_response) 
    RETURNING *;
END;
$$;