

CREATE OR REPLACE FUNCTION get_forms_by_project(p_auth_user_id UUID, p_project_id UUID)
RETURNS TABLE (
    formId UUID,
    projectId UUID,
    locationId UUID,
    projectName JSONB,
    locationName JSONB,
    form_language TEXT,
    form_title TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_forms_by_project');

    RETURN QUERY 
   SELECT * FROM (
    SELECT 
        f.formId,
        p.projectId,
        f.locationId,
        p.name AS projectName,
        l.name AS locationName,
        f.form_language,
        f.form_title
    FROM FORMS f
    INNER JOIN LOCATIONS l
      ON f.locationId = l.locationId
    INNER JOIN PROJECTS p
      ON l.projectId = p.projectId
    WHERE l.projectId = p_project_id
    UNION ALL
    SELECT 
        f.formId,
        p.projectId,
        f.locationId,
        p.name AS projectName,
        NULL::JSONB AS locationName,
        f.form_language,
        f.form_title
    FROM FORMS f
    JOIN PROJECTS p
      ON f.projectId = p.projectId
    WHERE p.projectId = p_project_id
    ) AS subquery;
END;
$$;

  
