DROP TRIGGER IF EXISTS trg_text_answers_eval    ON TEXT_ANSWERS;
DROP TRIGGER IF EXISTS trg_numeric_answers_eval ON NUMERIC_ANSWERS;
DROP TRIGGER IF EXISTS trg_rating_answers_eval  ON RATING_ANSWERS;
DROP TRIGGER IF EXISTS trg_option_answers_eval  ON ANSWER_OPTIONS;

CREATE TRIGGER trg_text_answers_eval
AFTER INSERT OR UPDATE ON TEXT_ANSWERS
FOR EACH ROW EXECUTE FUNCTION evaluate_criteria_for_answer();

CREATE TRIGGER trg_numeric_answers_eval
AFTER INSERT OR UPDATE ON NUMERIC_ANSWERS
FOR EACH ROW EXECUTE FUNCTION evaluate_criteria_for_answer();

CREATE TRIGGER trg_rating_answers_eval
AFTER INSERT OR UPDATE ON RATING_ANSWERS
FOR EACH ROW EXECUTE FUNCTION evaluate_criteria_for_answer();

CREATE TRIGGER trg_option_answers_eval
AFTER INSERT OR UPDATE ON ANSWER_OPTIONS
FOR EACH ROW EXECUTE FUNCTION evaluate_criteria_for_answer();


-- 7. Trigger on SUBMISSIONS.dateSubmitted
DROP TRIGGER IF EXISTS trg_submissions_finalize ON SUBMISSIONS;
CREATE TRIGGER trg_submissions_finalize
AFTER UPDATE OF dateSubmitted ON SUBMISSIONS
FOR EACH ROW EXECUTE FUNCTION finalize_submission_outcome();

SELECT
  n.nspname       AS schema,
  c.relname       AS table,
  t.tgname        AS trigger,
  CASE WHEN t.tgenabled = 'D' THEN 'DISABLED' ELSE 'ENABLED' END AS enabled,
  pg_get_triggerdef(t.oid, true) AS definition
FROM pg_trigger t
JOIN pg_class c  ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE NOT t.tgisinternal    -- skip system/internal triggers
  AND n.nspname NOT IN ('pg_catalog','information_schema')
ORDER BY n.nspname, c.relname, t.tgname;
