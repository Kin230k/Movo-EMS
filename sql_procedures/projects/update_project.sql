CREATE OR REPLACE PROCEDURE update_project(
    p_project_id UUID,
    p_name JSONB,
    p_badge_background VARCHAR(512),
    p_starting_date DATE,
    p_ending_date DATE,
    p_description JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE PROJECTS
    SET 
        name = p_name,
        badgeBackground = p_badge_background,
        startingDate = p_starting_date,
        endingDate = p_ending_date,
        description = p_description
    WHERE projectId = p_project_id;
END;
$$;