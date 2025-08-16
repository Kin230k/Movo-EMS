CREATE OR REPLACE FUNCTION get_form_by_id(p_auth_user_id UUID,p_form_id UUID)
RETURNS TABLE (
    formId UUID,
    projectId UUID,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_form_by_id');

RETURN QUERY 
    SELECT 
        f.formId,
        f.projectId,
        f.locationId
    FROM FORMS f
    WHERE f.formId = p_form_id;
END;
$$;