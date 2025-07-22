CREATE OR REPLACE FUNCTION get_all_forms()
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
    FROM FORMS f;
END;
$$;