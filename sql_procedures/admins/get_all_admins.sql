CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS TABLE (
    adminId UUID,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    qid VARCHAR(20),
    dateOfBirth DATE,
    jobPosition VARCHAR(100)
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.adminId,
        a.firstName,
        a.lastName,
        a.qid,
        a.dateOfBirth,
        a.jobPosition
    FROM ADMINS a;
END;
$$;