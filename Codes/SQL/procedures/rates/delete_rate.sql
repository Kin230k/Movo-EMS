CREATE OR REPLACE PROCEDURE delete_rate(p_auth_user_id UUID, p_rate_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_rate');

DELETE FROM RATES
    WHERE rateId = p_rate_id;
END;
$$;