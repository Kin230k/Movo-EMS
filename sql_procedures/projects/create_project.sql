CREATE OR REPLACE PROCEDURE create_project(
    p_name VARCHAR(255),
    p_badge_background VARCHAR(512),
    p_starting_date DATE,
    p_ending_date DATE,
    p_description VARCHAR(2000)
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO PROJECTS (
        name, 
        badgeBackground, 
        startingDate, 
        endingDate, 
        description
    ) VALUES (
        p_name,
        p_badge_background,
        p_starting_date,
        p_ending_date,
        p_description
    ) RETURNING *;
END;
$$;