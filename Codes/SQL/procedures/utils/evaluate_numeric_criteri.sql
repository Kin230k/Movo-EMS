CREATE OR REPLACE FUNCTION evaluate_numeric_criteria(
    op              criteria_operator,
    criterion_value TEXT,
    answer_value    NUMERIC
) RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  num_val     NUMERIC;
  range_start NUMERIC;
  range_end   NUMERIC;
  between_pass BOOLEAN;
BEGIN
  -- Try to parse the base number
  BEGIN
    num_val := criterion_value::NUMERIC;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END;

  -- If it's a between, parse its start/end
  IF op = 'between' THEN
    range_start := SPLIT_PART(criterion_value, ',', 1)::NUMERIC;
    range_end   := SPLIT_PART(criterion_value, ',', 2)::NUMERIC;
    between_pass := answer_value BETWEEN range_start AND range_end;
  END IF;

  -- Now return exactly one expression:
  RETURN CASE op
    WHEN '>'       THEN answer_value > num_val
    WHEN '<'       THEN answer_value < num_val
    WHEN '='       THEN answer_value = num_val
    WHEN '>='      THEN answer_value >= num_val
    WHEN '<='      THEN answer_value <= num_val
    WHEN '!='      THEN answer_value <> num_val
    WHEN 'between' THEN between_pass
    ELSE
      FALSE
  END;
END;
$$;
