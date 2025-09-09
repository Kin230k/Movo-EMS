CREATE OR REPLACE FUNCTION get_forms_by_location(p_auth_user_id UUID, p_location_id UUID)
RETURNS TABLE (
    formId UUID,
    locationId UUID,
    form_language TEXT,
    form_title TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_forms_by_location');

    RETURN QUERY 
    SELECT 
        f.formId,
        f.locationId,
        f.form_language,
        f.form_title
    FROM FORMS f
    WHERE f.locationId = p_location_id;
END;
$$;