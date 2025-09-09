CREATE OR REPLACE PROCEDURE create_form(
    p_auth_user_id UUID,
    p_project_id UUID DEFAULT NULL,
    p_location_id UUID DEFAULT NULL,
    p_form_language TEXT DEFAULT NULL,
    p_form_title TEXT DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_form');

    INSERT INTO FORMS (
        formId,
        projectId,
        locationId,
        form_language,
        form_title
    ) VALUES (
        gen_random_uuid(),
        p_project_id,
        p_location_id,
        p_form_language,
        p_form_title
    );
END;
$$;