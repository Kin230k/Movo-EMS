CREATE OR REPLACE PROCEDURE update_attendance(
    p_attendance_id UUID,
    p_date DATE,
    p_time TIME,
    p_signed_with signed_with_type,
    p_signed_by UUID,
    p_user_id UUID,
    p_area_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ATTENDANCES
    SET 
        date = p_date,
        time = p_time,
        signedWith = p_signed_with,
        signedBy = p_signed_by,
        userId = p_user_id,
        areaId = p_area_id
    WHERE attendanceId = p_attendance_id;
END;
$$;