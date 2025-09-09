CREATE OR REPLACE PROCEDURE update_form(
    p_auth_user_id UUID,
    p_form_id UUID,
    p_project_id UUID DEFAULT NULL,
    p_location_id UUID DEFAULT NULL,
    p_form_language TEXT DEFAULT NULL,
    p_form_title TEXT DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_form');

    UPDATE FORMS
    SET
        projectId = COALESCE(p_project_id, projectId),
        locationId = COALESCE(p_location_id, locationId),
        form_language = COALESCE(p_form_language, form_language),
        form_title = COALESCE(p_form_title, form_title)
    WHERE formId = p_form_id;
END;
$$;