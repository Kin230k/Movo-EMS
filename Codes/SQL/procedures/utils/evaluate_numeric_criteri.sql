CREATE OR REPLACE FUNCTION evaluate_numeric_criteria(
    op              criteria_operator,
    criterion_value TEXT,
    answer_value    NUMERIC
) RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
DECLARE
  num_val     NUMERIC;
  range_start NUMERIC;
  range_end   NUMERIC;
BEGIN
  BEGIN
    num_val := criterion_value::NUMERIC;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;

  IF op = 'between' THEN
    BEGIN
      range_start := SPLIT_PART(criterion_value, ',', 1)::NUMERIC;
      range_end   := SPLIT_PART(criterion_value, ',', 2)::NUMERIC;
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
    RETURN answer_value BETWEEN range_start AND range_end;
  END IF;

  RETURN CASE op
    WHEN '>'  THEN answer_value >  num_val
    WHEN '<'  THEN answer_value <  num_val
    WHEN '='  THEN answer_value =  num_val
    WHEN '>=' THEN answer_value >= num_val
    WHEN '<=' THEN answer_value <= num_val
    WHEN '!=' THEN answer_value <> num_val
    ELSE NULL
  END;
END;
$$;