CREATE OR REPLACE PROCEDURE delete_option(p_auth_user_id UUID, p_option_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_option');

DELETE FROM OPTIONS
    WHERE optionId = p_option_id;
END;
$$;