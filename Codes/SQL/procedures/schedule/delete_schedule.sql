CREATE OR REPLACE PROCEDURE delete_schedule(p_auth_user_id UUID, p_schedule_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
 deleted_count INTEGER;
BEGIN
 CALL check_user_permission(p_auth_user_id, 'delete_schedule');

 DELETE FROM SCHEDULES
 WHERE scheduleId = p_schedule_id;
 
 GET DIAGNOSTICS deleted_count = ROW_COUNT;
 
 IF deleted_count = 0 THEN
   RAISE EXCEPTION 'Schedule with ID % not found', p_schedule_id;
 END IF;
END;
$$;