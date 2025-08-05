-- Active: 1753794005229@@ep-divine-forest-a2lc92v7-pooler.eu-central-1.aws.neon.tech@5432@MOVO
-- src/db/procedures/edit_user_info.sql
CREATE OR REPLACE PROCEDURE edit_user_info(
  p_uid    UUID,
  p_name   JSON,
  p_picture TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update the multilingual name and picture fields; all other columns are left as-is.
  PERFORM update_user(
    p_uid,
    p_name,
    NULL,     -- email
    NULL,     -- phone
    p_picture, -- picture
    NULL,     -- role
    NULL,     -- status
    NULL    -- twoFaEnabled
  );
END;
$$;
