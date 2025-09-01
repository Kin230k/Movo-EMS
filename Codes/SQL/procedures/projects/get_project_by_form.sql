CREATE OR REPLACE FUNCTION get_project_by_form_id(p_auth_user_id UUID,p_form_id UUID)
RETURNS TABLE (
    projectId UUID,
    clientId UUID,
    name JSONB,
    badgeBackground VARCHAR(512),
    startingDate DATE,
    endingDate DATE,
    description JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN

CALL check_user_permission(p_auth_user_id, 'get_project_by_form_id');

    RETURN QUERY 
    SELECT 
        p.projectId,
        p.clientId,
        p.name,
        p.badgeBackground,
        p.startingDate,
        p.endingDate,
        p.description
    FROM FORMS f
    LEFT JOIN LOCATIONS l ON f.locationId = l.locationId
    INNER JOIN PROJECTS p ON p.projectId = COALESCE(f.projectId, l.projectId)
    WHERE f.formId = p_form_id;
END;
$$;