CREATE OR REPLACE FUNCTION get_forms_by_project(p_project_id UUID)
RETURNS TABLE (
    formId UUID,
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_forms_by_project');

RETURN QUERY 
    SELECT 
        f.formId,
        f.locationId
    FROM FORMS f
    WHERE f.projectId = p_project_id;
END;
$$;