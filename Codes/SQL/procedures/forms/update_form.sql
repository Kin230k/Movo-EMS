CREATE OR REPLACE PROCEDURE update_form(
    p_form_id UUID,
    p_project_id UUID,
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE FORMS
    SET 
        projectId = p_project_id,
        locationId = p_location_id
    WHERE formId = p_form_id;
END;
$$;