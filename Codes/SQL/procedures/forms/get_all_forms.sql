
CREATE OR REPLACE FUNCTION get_all_forms(p_auth_user_id UUID)
RETURNS TABLE (
    formId UUID,
    projectId UUID,
    locationId UUID,
    form_language TEXT,
    form_title TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_forms');

    RETURN QUERY 
    SELECT 
        f.formId,
        f.projectId,
        f.locationId,
        f.form_language,
        f.form_title
    FROM FORMS f;
END;
$$;