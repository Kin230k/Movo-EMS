CREATE OR REPLACE FUNCTION evaluate_text_criteria(
    op              criteria_operator,
    criterion_value TEXT,
    answer_value    TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
BEGIN
  IF answer_value IS NULL OR criterion_value IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN CASE op
    WHEN '='        THEN answer_value = criterion_value
    WHEN '!='       THEN answer_value <> criterion_value
    WHEN 'contains' THEN answer_value ILIKE '%' || criterion_value || '%'
    ELSE NULL
  END;
END;
$$;