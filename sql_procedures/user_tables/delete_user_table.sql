CREATE OR REPLACE PROCEDURE delete_user_table_entry(p_user_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM USER_TABLE
    WHERE userId = p_user_id;
END;
$$;