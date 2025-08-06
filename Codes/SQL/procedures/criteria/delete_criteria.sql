CREATE OR REPLACE PROCEDURE delete_criterion(p_auth_user_id UUID, p_criterion_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_criteria');

DELETE FROM CRITERIA
    WHERE criterionId = p_criterion_id;
END;
$$;