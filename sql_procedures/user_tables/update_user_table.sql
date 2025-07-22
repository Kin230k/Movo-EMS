CREATE OR REPLACE PROCEDURE update_user_table_entry(
    p_user_id INT,
    p_username VARCHAR(100)
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE USER_TABLE
    SET username = p_username
    WHERE userId = p_user_id;
END;
$$;