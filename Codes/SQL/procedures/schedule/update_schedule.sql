CREATE OR REPLACE PROCEDURE update_schedule(p_auth_user_id UUID, 
    p_schedule_id UUID,
    p_date DATE DEFAULT NULL,
    p_start_time TIME DEFAULT NULL,
    p_end_time TIME DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_location_id UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_schedule');

-- Validate time logic only when both times provided
    IF p_start_time IS NOT NULL AND p_end_time IS NOT NULL AND p_start_time >= p_end_time THEN
        RAISE EXCEPTION 'Start time (%) must be before end time (%)', 
            p_start_time, p_end_time;
    END IF;

    UPDATE SCHEDULES
    SET 
        date = COALESCE(p_date, date),
        startTime = COALESCE(p_start_time, startTime),
        endTime = COALESCE(p_end_time, endTime),
        projectId = COALESCE(p_project_id, projectId),
        locationId = COALESCE(p_location_id, locationId)
    WHERE scheduleId = p_schedule_id;
END;
$$;