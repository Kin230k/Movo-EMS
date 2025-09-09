
CREATE OR REPLACE FUNCTION get_questions_by_form(
  p_auth_user_id UUID,
  p_form_id UUID
)
RETURNS TABLE (
  questionid UUID,
  typecode VARCHAR(30),
  questiontext TEXT,
  criteria JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  CALL check_user_permission(p_auth_user_id, 'get_questions_by_form');

  RETURN QUERY
  SELECT
    q.questionid,
    q.typecode,
    q.questiontext,
    COALESCE(
      (
        SELECT jsonb_agg(to_jsonb(c) - 'questionid')
        FROM criteria c
        WHERE c.questionid = q.questionid
      ),
      '[]'::jsonb
    ) AS criteria
  FROM questions q
  WHERE q.formid = p_form_id;
END;
$$;
