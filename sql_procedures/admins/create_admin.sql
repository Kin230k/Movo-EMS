CREATE OR REPLACE PROCEDURE create_admin(
    p_name JSONB
    p_qid VARCHAR(20),
    p_date_of_birth DATE,
    p_job_position VARCHAR(100)
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ADMINS (
        name, 
        qid, 
        dateOfBirth, 
        jobPosition
    ) VALUES (
        p_name,
        p_qid,
        p_date_of_birth,
        p_job_position
    );
END;
$$;