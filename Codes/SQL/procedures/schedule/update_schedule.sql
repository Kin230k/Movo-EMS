
CREATE OR REPLACE PROCEDURE update_schedule(p_auth_user_id UUID,
 p_schedule_id UUID,
 p_start_time TIMESTAMP DEFAULT NULL,
 p_end_time TIMESTAMP DEFAULT NULL,
 p_project_id UUID DEFAULT NULL,
 p_location_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
 current_project_id UUID;
 current_location_id UUID;
 new_project_id UUID;
 new_location_id UUID;
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_schedule');

 -- Get current values to validate constraint
 SELECT projectId, locationId INTO current_project_id, current_location_id
 FROM SCHEDULES WHERE scheduleId = p_schedule_id;
 
 IF NOT FOUND THEN
   RAISE EXCEPTION 'Schedule with ID % not found', p_schedule_id;
 END IF;

 -- Determine new values
 new_project_id := COALESCE(p_project_id, current_project_id);
 new_location_id := COALESCE(p_location_id, current_location_id);

 -- Validate constraint: either projectId or locationId must be set, but not both
 IF (new_project_id IS NOT NULL AND new_location_id IS NOT NULL) THEN
   RAISE EXCEPTION 'Either projectId or locationId must be set, but not both';
 END IF;
 
 IF (new_project_id IS NULL AND new_location_id IS NULL) THEN
   RAISE EXCEPTION 'Either projectId or locationId must be set';
 END IF;

 -- Validate time logic only when both times provided
 IF p_start_time IS NOT NULL AND p_end_time IS NOT NULL AND p_start_time >= p_end_time THEN
   RAISE EXCEPTION 'Start time (%) must be before end time (%)',
   p_start_time, p_end_time;
 END IF;

 UPDATE SCHEDULES
 SET
   startTime = COALESCE(p_start_time, startTime),
   endTime = COALESCE(p_end_time, endTime),
   projectId = new_project_id,
   locationId = new_location_id
 WHERE scheduleId = p_schedule_id;
END;
$$;