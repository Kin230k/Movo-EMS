CREATE OR REPLACE PROCEDURE create_admin(p_auth_user_id UUID,
 p_name JSONB,
 p_qid VARCHAR(20),
 p_date_of_birth DATE,
 p_job_position VARCHAR(100)
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_admin');

INSERT INTO ADMINS (
 adminId,
 name,
 qid,
 dateOfBirth,
 jobPosition
 ) VALUES (
 gen_random_uuid(),
 p_name,
 p_qid,
 p_date_of_birth,
 p_job_position
 );
END;
$$;