CREATE OR REPLACE FUNCTION get_all_user_table_entries()
RETURNS TABLE (userId INT, username VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT ut.userId, ut.username
    FROM USER_TABLE ut;
END;
$$;