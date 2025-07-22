CREATE OR REPLACE PROCEDURE create_attendance(
    p_date DATE,
    p_time TIME,
    p_signed_with signed_with_type,
    p_signed_by UUID,
    p_user_id UUID,
    p_area_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ATTENDANCE (
        date, 
        time, 
        signedWith, 
        signedBy, 
        userId, 
        areaId
    ) VALUES (
        p_date,
        p_time,
        p_signed_with,
        p_signed_by,
        p_user_id,
        p_area_id
    ) RETURNING *;
END;
$$;