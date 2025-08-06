CREATE OR REPLACE PROCEDURE update_form(p_auth_user_id UUID, 
    p_form_id UUID,
    p_project_id UUID DEFAULT NULL,
    p_location_id UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_form');

UPDATE FORMS
    SET 
        projectId = COALESCE(p_project_id, projectId),
        locationId = COALESCE(p_location_id, locationId)
    WHERE formId = p_form_id;
END;
$$;