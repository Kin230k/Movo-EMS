CREATE OR REPLACE PROCEDURE update_admin(
    p_admin_id UUID,
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_qid VARCHAR(20),
    p_date_of_birth DATE,
    p_job_position VARCHAR(100)
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ADMINS
    SET 
        firstName = p_first_name,
        lastName = p_last_name,
        qid = p_qid,
        dateOfBirth = p_date_of_birth,
        jobPosition = p_job_position
    WHERE adminId = p_admin_id;
END;
$$;