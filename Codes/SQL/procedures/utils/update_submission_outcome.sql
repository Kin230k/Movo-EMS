-- 4. Submission outcome updater (priority‐ordered rules)
CREATE OR REPLACE FUNCTION update_submission_outcome(sub_id UUID)
RETURNS VOID AS $$
DECLARE
    rule       RECORD;
    all_passed BOOLEAN;
BEGIN
    FOR rule IN
        SELECT ruleId, outcomeOnPass
          FROM DECISION_RULES
         ORDER BY priority
    LOOP
        SELECT BOOL_AND(cr.passed) INTO all_passed
          FROM RULE_CRITERIA rc
          JOIN CRITERIA_RESULTS cr USING (criterionId)
          JOIN ANSWERS a          ON cr.answerId = a.answerId
         WHERE rc.ruleId = rule.ruleId
           AND a.submissionId = sub_id;

        IF all_passed THEN
            UPDATE SUBMISSIONS
               SET outcome = rule.outcomeOnPass
             WHERE submissionId = sub_id;
            RETURN;
        END IF;
    END LOOP;

    -- fallback if no rule fully passed
    UPDATE SUBMISSIONS
       SET outcome = 'MANUAL_REVIEW'
     WHERE submissionId = sub_id;
END;
$$ LANGUAGE plpgsql;