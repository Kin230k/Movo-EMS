CREATE OR REPLACE PROCEDURE create_authority(p_name VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO AUTHORITIES (name) 
    VALUES (p_name) 
    RETURNING *;
END;
$$;