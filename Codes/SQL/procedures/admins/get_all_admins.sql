CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS TABLE (
    adminId UUID,
    name JSONB,
    qid VARCHAR(20),
    dateOfBirth DATE,
    jobPosition VARCHAR(100)
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_admins');

RETURN QUERY 
    SELECT 
        a.adminId,
        a.name,
        a.qid,
        a.dateOfBirth,
        a.jobPosition
    FROM ADMINS a;
END;
$$;