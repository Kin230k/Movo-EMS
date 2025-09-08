CREATE OR REPLACE FUNCTION get_project_user_role_by_user(
    p_user_id      UUID
)
RETURNS TABLE (
    projectuserroleid UUID,
    userid            UUID,
    projectid         UUID,
    roleid            UUID,
    createdAt         TIMESTAMP,
    updatedAt         TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check caller permission (must exist as a procedure)

    -- Return the last PROJECT_USER_ROLES record for the given user
    RETURN QUERY
    SELECT pur.projectuserroleid,
           pur.userid,
           pur.projectid,
           pur.roleid,
           pur.createdAt, 
           pur.updatedAt
    FROM project_user_roles pur
    WHERE pur.userid = p_user_id
    ORDER BY pur.createdat DESC
    LIMIT 1;
END;
$$;
