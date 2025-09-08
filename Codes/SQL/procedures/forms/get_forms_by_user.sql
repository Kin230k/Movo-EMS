CREATE OR REPLACE FUNCTION get_forms_by_user(p_auth_user_id UUID,p_user_id UUID)
RETURNS TABLE (
    formId UUID,
    projectId UUID,
    locationId UUID,
    form_language TEXT,
    form_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
    -- permission check
    CALL check_user_permission(p_auth_user_id, 'get_forms_by_user');

    RETURN QUERY
    -- forms attached directly to projects where the user has a role
    SELECT f.formId,
           f.projectId,
           f.locationId,
           f.form_language,
           f.form_title
    FROM FORMS f
    JOIN PROJECT_USER_ROLES pur
      ON f.projectId = pur.projectId
    WHERE pur.userId = p_user_id

    UNION ALL

    -- forms attached to locations (resolve location -> project -> user's role)
    SELECT f.formId,
           f.projectId,
           f.locationId,
           f.form_language,
           f.form_title
    FROM FORMS f
    JOIN LOCATIONS l
      ON f.locationId = l.locationId
    JOIN PROJECT_USER_ROLES pur
      ON l.projectId = pur.projectId
    WHERE pur.userId = p_user_id;
END;
$$;
