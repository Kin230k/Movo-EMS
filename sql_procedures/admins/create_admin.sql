CREATE OR REPLACE PROCEDURE create_admin(
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_qid VARCHAR(20),
    p_date_of_birth DATE,
    p_job_position VARCHAR(100)
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ADMINS (
        firstName, 
        lastName, 
        qid, 
        dateOfBirth, 
        jobPosition
    ) VALUES (
        p_first_name,
        p_last_name,
        p_qid,
        p_date_of_birth,
        p_job_position
    ) RETURNING *;
END;
$$;