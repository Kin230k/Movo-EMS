
CREATE OR REPLACE FUNCTION update_submission_outcome(sub_id UUID)
RETURNS VOID AS $$
DECLARE
  rule_record  RECORD;
  all_passed   BOOLEAN;
BEGIN
  FOR rule_record IN
    SELECT ruleId, outcomeOnPass FROM DECISION_RULES ORDER BY priority
  LOOP
    SELECT BOOL_AND(cr.outcome = 'PASSED') INTO all_passed
      FROM RULE_CRITERIA rc
      JOIN CRITERIA_RESULTS cr USING (criterionId)
      JOIN ANSWERS a USING (answerId)
     WHERE rc.ruleId = rule_record.ruleId
       AND a.submissionId = sub_id;

    IF all_passed THEN
      UPDATE SUBMISSIONS
         SET outcome = rule_record.outcomeOnPass
       WHERE submissionId = sub_id;
      RETURN;
    END IF;
  END LOOP;

  -- fallback to manual review
  UPDATE SUBMISSIONS
     SET outcome = 'MANUAL_REVIEW'
   WHERE submissionId = sub_id;
END;
$$ LANGUAGE plpgsql;