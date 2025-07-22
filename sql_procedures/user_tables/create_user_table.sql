CREATE OR REPLACE PROCEDURE create_user_table_entry(
    p_username VARCHAR(100)
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO USER_TABLE (username) 
    VALUES (p_username) 
    RETURNING *;
END;
$$;