CREATE OR REPLACE PROCEDURE update_admin(p_auth_user_id UUID, 
    p_admin_id UUID,
    p_name JSONB DEFAULT NULL,
    p_qid VARCHAR(20) DEFAULT NULL,
    p_date_of_birth DATE DEFAULT NULL,
    p_job_position VARCHAR(100) DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_admin');

UPDATE ADMINS
    SET 
        name = COALESCE(p_name, name),
        qid = COALESCE(p_qid, qid),
        dateOfBirth = COALESCE(p_date_of_birth, dateOfBirth),
        jobPosition = COALESCE(p_job_position, jobPosition)
    WHERE adminId = p_admin_id;
END;
$$;