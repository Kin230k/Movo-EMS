CREATE OR REPLACE PROCEDURE create_project(
    p_name JSONB,
    p_badge_background VARCHAR(512),
    p_starting_date DATE,
    p_ending_date DATE,
    p_description JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO PROJECTS (
        projectId,
        name, 
        badgeBackground, 
        startingDate, 
        endingDate, 
        description
    ) VALUES (
        gen_random_uuid(),
        p_name,
        p_badge_background,
        p_starting_date,
        p_ending_date,
        p_description
    ) ;
END;
$$;