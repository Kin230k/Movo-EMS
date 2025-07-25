CREATE OR REPLACE FUNCTION get_forms_by_project(p_project_id UUID)
RETURNS TABLE (
    formId UUID,
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        f.formId,
        f.locationId
    FROM FORMS f
    WHERE f.projectId = p_project_id;
END;
$$;