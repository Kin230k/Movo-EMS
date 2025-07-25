CREATE OR REPLACE FUNCTION get_admin_by_id(p_admin_id UUID)
RETURNS TABLE (
    adminId UUID,
    name JSONB,
    qid VARCHAR(20),
    dateOfBirth DATE,
    jobPosition VARCHAR(100)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.adminId,
        a.name,
        a.qid,
        a.dateOfBirth,
        a.jobPosition
    FROM ADMINS a
    WHERE a.adminId = p_admin_id;
END;
$$;