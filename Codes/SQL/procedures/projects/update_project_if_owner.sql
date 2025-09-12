CREATE OR REPLACE PROCEDURE update_project_if_owner(
  p_auth_user_id UUID,
  p_project_id UUID,
  p_name JSONB DEFAULT NULL,
  p_badge_background VARCHAR(512) DEFAULT NULL,
  p_starting_date DATE DEFAULT NULL,
  p_ending_date DATE DEFAULT NULL,
  p_description JSONB DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Get the clientId for the project
  SELECT clientId INTO v_client_id
  FROM PROJECTS
  WHERE projectId = p_project_id;

  -- Ensure the project exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project with ID % not found', p_project_id;
  END IF;


  -- Validate date logic only when both dates provided
  IF p_starting_date IS NOT NULL AND p_ending_date IS NOT NULL AND p_starting_date > p_ending_date THEN
    RAISE EXCEPTION 'Starting date (%) cannot be after ending date (%)',
      p_starting_date, p_ending_date;
  END IF;

  -- Perform the update
  UPDATE PROJECTS
  SET
    name = COALESCE(p_name, name),
    badgeBackground = COALESCE(p_badge_background, badgeBackground),
    startingDate = COALESCE(p_starting_date, startingDate),
    endingDate = COALESCE(p_ending_date, endingDate),
    description = COALESCE(p_description, description)
  WHERE projectId = p_project_id;
END;
$$;
