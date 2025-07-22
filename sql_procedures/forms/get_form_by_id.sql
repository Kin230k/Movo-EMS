CREATE OR REPLACE FUNCTION get_form_by_id(p_form_id UUID)
RETURNS TABLE (
    formId UUID,
    projectId UUID,
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        f.formId,
        f.projectId,
        f.locationId
    FROM FORMS f
    WHERE f.formId = p_form_id;
END;
$$;