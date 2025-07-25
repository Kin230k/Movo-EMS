CREATE OR REPLACE PROCEDURE delete_schedule(p_schedule_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM SCHEDULES
    WHERE scheduleId = p_schedule_id;
END;
$$;