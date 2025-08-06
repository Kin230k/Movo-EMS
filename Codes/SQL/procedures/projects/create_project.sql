CREATE OR REPLACE PROCEDURE create_project(p_auth_user_id UUID, 
    p_name JSONB,
    p_badge_background VARCHAR(512),
    p_starting_date DATE,
    p_ending_date DATE,
    p_description JSONB
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'create_project');

-- Validate date logic
    IF p_starting_date > p_ending_date THEN
        RAISE EXCEPTION 'Starting date (%) cannot be after ending date (%)', 
            p_starting_date, p_ending_date;
    END IF;

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
    );
END;
$$;