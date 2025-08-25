CREATE OR REPLACE FUNCTION evaluate_criteria_for_answer()
RETURNS TRIGGER AS $$
DECLARE
  answer_qid     UUID;
  criterion       RECORD;
  question_type   TEXT;
  raw_text        TEXT;
  raw_numeric     NUMERIC;
  eval_result     BOOLEAN;
  crit_effect     criterion_effect;
  answer_outcome  answer_result_outcome := 'MANUAL';
  found_match     BOOLEAN := FALSE;
BEGIN
  -- Lookup the questionId for this answer
  SELECT questionId
    INTO answer_qid
    FROM ANSWERS
   WHERE answerId = NEW.answerId;

  -- Fetch the question type
  SELECT typeCode
    INTO question_type
    FROM QUESTIONS
   WHERE questionId = answer_qid;

  -- Loop through all criteria for this question
  FOR criterion IN
    SELECT * FROM CRITERIA WHERE questionId = answer_qid
  LOOP
    -- extract raw answer & evaluate
    CASE question_type
      WHEN 'OPEN_ENDED','SHORT_ANSWER' THEN
        SELECT response INTO raw_text
          FROM TEXT_ANSWERS WHERE answerId = NEW.answerId;
        eval_result := evaluate_text_criteria(
                         criterion.type, criterion.value, raw_text
                       );

      WHEN 'NUMBER' THEN
        SELECT response INTO raw_numeric
          FROM NUMERIC_ANSWERS WHERE answerId = NEW.answerId;
        eval_result := evaluate_numeric_criteria(
                         criterion.type, criterion.value, raw_numeric
                       );

      WHEN 'RATE' THEN
        SELECT rating::NUMERIC INTO raw_numeric
          FROM RATING_ANSWERS WHERE answerId = NEW.answerId;
        eval_result := evaluate_numeric_criteria(
                         criterion.type, criterion.value, raw_numeric
                       );

      WHEN 'DROPDOWN','RADIO' THEN
        SELECT o.optionText->>current_setting('app.locale',true)
          INTO raw_text
        FROM ANSWER_OPTIONS ao
        JOIN OPTIONS o USING (optionId)
        WHERE ao.answerId = NEW.answerId
        LIMIT 1;
        eval_result := evaluate_text_criteria(
                         criterion.type, criterion.value, raw_text
                       );

      WHEN 'MULTIPLE_CHOICE' THEN
        SELECT STRING_AGG(
                 o.optionText->>current_setting('app.locale',true), ','
               ) INTO raw_text
        FROM ANSWER_OPTIONS ao
        JOIN OPTIONS o USING (optionId)
        WHERE ao.answerId = NEW.answerId;
        eval_result := evaluate_text_criteria(
                         criterion.type, criterion.value, raw_text
                       );

      ELSE
        eval_result := NULL;
    END CASE;

    -- insert per-criterion result, casting each branch to the enum
    INSERT INTO CRITERIA_RESULTS (
      criterionResultId,
      answerId,
      criterionId,
      outcome
    ) VALUES (
      gen_random_uuid(),
      NEW.answerId,
      criterion.criterionId,
      CASE
        WHEN eval_result IS NULL 
          THEN 'MANUAL'::answer_result_outcome
        WHEN criterion.effect = 'PASS' AND eval_result 
          THEN 'PASSED'::answer_result_outcome
        WHEN criterion.effect = 'PASS' AND NOT eval_result 
          THEN 'FAILED'::answer_result_outcome
        WHEN criterion.effect = 'FAIL' AND eval_result 
          THEN 'FAILED'::answer_result_outcome
        WHEN criterion.effect = 'FAIL' AND NOT eval_result 
          THEN 'PASSED'::answer_result_outcome
      END
    );

    -- capture first TRUE for the overall answer outcome
    IF NOT found_match AND eval_result IS TRUE THEN
      found_match := TRUE;
      answer_outcome := CASE 
                          WHEN criterion.effect = 'PASS'
                            THEN 'PASSED'::answer_result_outcome
                          ELSE 'FAILED'::answer_result_outcome
                        END;
    END IF;
  END LOOP;

  -- upsert combined answer‐level result (already enum, no cast needed)
  INSERT INTO ANSWER_RESULTS(answerId, outcome)
    VALUES (NEW.answerId, answer_outcome)
  ON CONFLICT (answerId) DO UPDATE
    SET outcome = EXCLUDED.outcome;

    PERFORM submission_answer_count();

  -- recompute submission outcome
  PERFORM update_submission_outcome(
    (SELECT submissionId FROM ANSWERS WHERE answerId = NEW.answerId)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
