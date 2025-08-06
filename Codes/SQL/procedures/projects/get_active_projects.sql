CREATE OR REPLACE FUNCTION get_active_projects()
RETURNS TABLE (
    projectId UUID,
    name JSONB,
	badgeBackground VARCHAR(512),
    startingDate DATE,
    endingDate DATE,
	description JSONB
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_active_projects');

RETURN QUERY 
    SELECT 
        p.projectId,
        p.name,
		p.badgeBackground,
        p.startingDate,
        p.endingDate,
		p.description
    FROM PROJECTS p
    WHERE CURRENT_DATE BETWEEN p.startingDate AND p.endingDate;
END;
$$;