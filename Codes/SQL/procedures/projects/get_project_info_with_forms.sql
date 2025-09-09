CREATE OR REPLACE FUNCTION get_project_info_with_forms(
  p_auth_user_id UUID,
  p_project_id UUID
)
RETURNS TABLE (
  projectId UUID,
  clientId UUID,
  name JSONB,
  badgeBackground VARCHAR(512),
  startingDate DATE,
  endingDate DATE,
  description JSONB,
  formId UUID,
  locationId UUID,
  locationName JSONB,
  siteMap VARCHAR(512),
  longitude NUMERIC,
  latitude NUMERIC,
  form_language TEXT,
  form_title TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CALL check_user_permission(p_auth_user_id, 'get_project_info_with_forms');

  RETURN QUERY
  -- project-level forms (forms attached to project, not to a location)
  SELECT
    p.projectId,
    p.clientId,
    p.name,
    p.badgeBackground,
    p.startingDate,
    p.endingDate,
    p.description,
    f.formId,
    NULL::UUID AS locationId,
    NULL::JSONB AS locationName,
    NULL::VARCHAR(512) AS siteMap,
    NULL::NUMERIC AS longitude,
    NULL::NUMERIC AS latitude,
    f.form_language,
    f.form_title
  FROM PROJECTS p
  INNER JOIN FORMS f
    ON f.projectId = p.projectId
    AND f.locationId IS NULL
  WHERE p.projectId = p_project_id

  UNION ALL

  -- location-level forms (forms attached to a location)
  SELECT
    p.projectId,
    p.clientId,
    p.name,
    p.badgeBackground,
    p.startingDate,
    p.endingDate,
    p.description,
    f.formId,
    l.locationId,
    l.name AS locationName,
    l.siteMap,
    l.longitude,
    l.latitude,
    f.form_language,
    f.form_title
  FROM PROJECTS p
  INNER JOIN LOCATIONS l
    ON l.projectId = p.projectId
  INNER JOIN FORMS f
    ON f.locationId = l.locationId
  WHERE p.projectId = p_project_id

  UNION ALL

  -- fallback: if project has no forms at all, return one row with NULL form/location fields
  SELECT
    p.projectId,
    p.clientId,
    p.name,
    p.badgeBackground,
    p.startingDate,
    p.endingDate,
    p.description,
    NULL::UUID AS formId,
    NULL::UUID AS locationId,
    NULL::JSONB AS locationName,
    NULL::VARCHAR(512) AS siteMap,
    NULL::NUMERIC AS longitude,
    NULL::NUMERIC AS latitude,
    NULL::TEXT AS form_language,
    NULL::TEXT AS form_title
  FROM PROJECTS p
  WHERE p.projectId = p_project_id
    AND NOT EXISTS (
      SELECT 1 FROM FORMS f WHERE f.projectId = p.projectId
    )

  -- optional deterministic ordering
  ORDER BY locationId NULLS FIRST, formId;
END;
$$;
