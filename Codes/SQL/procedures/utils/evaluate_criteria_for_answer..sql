CREATE OR REPLACE FUNCTION evaluate_criteria_for_answer()
RETURNS TRIGGER AS $$
DECLARE
  answer_qid     UUID;
  criterion       RECORD;
  question_type   TEXT;
  raw_text        TEXT;
  raw_numeric     NUMERIC;
  eval_result     BOOLEAN;
  answer_outcome  answer_result_outcome := 'MANUAL';
  found_match     BOOLEAN := FALSE;
  sub_id          UUID;

  -- option-specific vars
  opt_correct     BOOLEAN;
  all_correct     BOOLEAN;
  selected_count  INT;
BEGIN
  -- Lookup the questionId for this answer
  SELECT questionId
    INTO answer_qid
    FROM answers
   WHERE answerId = NEW.answerId;

  -- Fetch the question type
  SELECT typeCode
    INTO question_type
    FROM questions
   WHERE questionId = answer_qid;

  ----------------------------------------------------------------
  -- Handle option-based question types (no criteria rows exist)
  ----------------------------------------------------------------
  IF question_type IN ('DROPDOWN','RADIO','MULTIPLE_CHOICE') THEN

    -- remove any previous per-criterion rows for this answer (optional)
    DELETE FROM criteria_results WHERE answerId = NEW.answerId;


    IF question_type IN ('DROPDOWN','RADIO') THEN
      -- single selected option -> check its isCorrect flag
      SELECT o.isCorrect
        INTO opt_correct
      FROM answer_options ao
      JOIN options o USING (optionId)
      WHERE ao.answerId = NEW.answerId
      LIMIT 1;

      IF opt_correct THEN
        answer_outcome := 'PASSED';
      ELSE
        answer_outcome := 'FAILED';
      END IF;

    ELSE
      -- MULTIPLE_CHOICE: require all selected options to be correct
DECLARE
  total_correct_count INT;

  -- Get the total number of correct options for this question
  SELECT COUNT(*) INTO total_correct_count
  FROM options
  WHERE questionId = answer_qid AND isCorrect = TRUE;

  -- Get the number of selected options and whether they're all correct
  SELECT bool_and(o.isCorrect) AS all_correct, count(*) AS selected_count
    INTO all_correct, selected_count
  FROM answer_options ao
  JOIN options o USING (optionId)
  WHERE ao.answerId = NEW.answerId;

  -- Compare selected count with total correct count
  IF selected_count = total_correct_count AND all_correct THEN
    answer_outcome := 'PASSED';
  ELSE
    answer_outcome := 'FAILED';
  END IF;
    END IF;

    -- upsert combined answer-level result (no per-criterion rows exist)
    INSERT INTO answer_results(answerId, outcome)
      VALUES (NEW.answerId, answer_outcome)
    ON CONFLICT (answerId) DO UPDATE
      SET outcome = EXCLUDED.outcome;

    -- assign submissionId & recompute counts/outcome
    SELECT submissionId INTO sub_id
      FROM answers
     WHERE answerId = NEW.answerId;

    PERFORM submission_answer_count(sub_id);
    PERFORM update_submission_outcome(sub_id);

    RETURN NEW;
  END IF;

  ----------------------------------------------------------------
  -- Non-option questions: evaluate using criteria table (original logic)
  ----------------------------------------------------------------
  FOR criterion IN
    SELECT * FROM criteria WHERE questionId = answer_qid
  LOOP
    -- extract raw answer & evaluate
    CASE question_type
      WHEN 'OPEN_ENDED','SHORT_ANSWER' THEN
        SELECT response INTO raw_text
          FROM text_answers WHERE answerId = NEW.answerId;

        -- CAST criterion.type to the enum here
        eval_result := evaluate_text_criteria(
                         criterion.type::criteria_operator,
                         criterion.value,
                         raw_text
                       );

      WHEN 'NUMBER' THEN
        SELECT response INTO raw_numeric
          FROM numeric_answers WHERE answerId = NEW.answerId;

        eval_result := evaluate_numeric_criteria(
                         criterion.type::criteria_operator,
                         criterion.value,
                         raw_numeric
                       );

      WHEN 'RATE' THEN
        SELECT rating::NUMERIC INTO raw_numeric
          FROM rating_answers WHERE answerId = NEW.answerId;

        eval_result := evaluate_numeric_criteria(
                         criterion.type::criteria_operator,
                         criterion.value,
                         raw_numeric
                       );

      ELSE
        eval_result := NULL;
    END CASE;

    -- insert per-criterion result
    INSERT INTO criteria_results (
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

  -- upsert combined answer‐level result
  INSERT INTO answer_results(answerId, outcome)
    VALUES (NEW.answerId, answer_outcome)
  ON CONFLICT (answerId) DO UPDATE
    SET outcome = EXCLUDED.outcome;
   
  -- assign submissionId
  SELECT submissionId INTO sub_id 
    FROM answers 
   WHERE answerId = NEW.answerId;

  -- recompute counts and outcomes
  PERFORM submission_answer_count(sub_id);
  PERFORM update_submission_outcome(sub_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
