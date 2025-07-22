CREATE OR REPLACE PROCEDURE create_numeric_answer(p_response NUMERIC)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO NUMERIC_ANSWERS (response) 
    VALUES (p_response) 
    RETURNING *;
END;
$$;