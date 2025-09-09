CREATE OR REPLACE FUNCTION get_forms_by_client(p_auth_user_id UUID, p_client_id UUID)
RETURNS TABLE (
    formId UUID,
    projectId UUID,
    locationId UUID,
    projectName JSONB,
    locationName JSONB,
    clientName JSONB,
    form_language TEXT,
    form_title TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_forms_by_client');

    RETURN QUERY
    SELECT * FROM (
        -- Forms directly linked to projects of the client
        SELECT
            f.formId,
            p.projectId,
            f.locationId,
            p.name AS projectName,
            NULL::JSONB AS locationName,
            c.name AS clientName,
            f.form_language,
            f.form_title
        FROM FORMS f
        INNER JOIN PROJECTS p ON f.projectId = p.projectId
        INNER JOIN CLIENTS c ON p.clientId = c.clientId
        WHERE c.clientId = p_client_id
        UNION ALL
        -- Forms linked to locations that belong to projects of the client
        SELECT
            f.formId,
            p.projectId,
            f.locationId,
            p.name AS projectName,
            l.name AS locationName,
            c.name AS clientName,
            f.form_language,
            f.form_title
        FROM FORMS f
        INNER JOIN LOCATIONS l ON f.locationId = l.locationId
        INNER JOIN PROJECTS p ON l.projectId = p.projectId
        INNER JOIN CLIENTS c ON p.clientId = c.clientId
        WHERE c.clientId = p_client_id
    ) AS subquery;
END;
$$;
