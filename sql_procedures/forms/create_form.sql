CREATE OR REPLACE PROCEDURE create_form(
    p_project_id UUID,
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO FORMS (
        projectId, 
        locationId
    ) VALUES (
        p_project_id,
        p_location_id
    ) RETURNING *;
END;
$$;