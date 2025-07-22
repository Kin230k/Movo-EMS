CREATE OR REPLACE FUNCTION get_user_table_entry_by_id(p_user_id INT)
RETURNS TABLE (userId INT, username VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT ut.userId, ut.username
    FROM USER_TABLE ut
    WHERE ut.userId = p_user_id;
END;
$$;