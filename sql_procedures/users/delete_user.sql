CREATE OR REPLACE PROCEDURE delete_user(p_user_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM USERS
    WHERE userId = p_user_id;
END;
$$;