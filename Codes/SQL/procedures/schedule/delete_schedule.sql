CREATE OR REPLACE PROCEDURE delete_schedule(p_auth_user_id UUID, p_schedule_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_schedule');

DELETE FROM SCHEDULES
 WHERE scheduleId = p_schedule_id;
END;
$$;