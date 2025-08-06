-- 1. Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trg_text_answers_eval    ON TEXT_ANSWERS;
DROP TRIGGER IF EXISTS trg_numeric_answers_eval ON NUMERIC_ANSWERS;
DROP TRIGGER IF EXISTS trg_rating_answers_eval  ON RATING_ANSWERS;
DROP TRIGGER IF EXISTS trg_option_answers_eval  ON ANSWER_OPTIONS;
DROP TRIGGER IF EXISTS trg_submissions_finalize ON SUBMISSIONS;

-- 2. Create triggers to evaluate criteria on answer insert/update
CREATE TRIGGER trg_text_answers_eval
  AFTER INSERT OR UPDATE ON TEXT_ANSWERS
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_criteria_for_answer();

CREATE TRIGGER trg_numeric_answers_eval
  AFTER INSERT OR UPDATE ON NUMERIC_ANSWERS
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_criteria_for_answer();

CREATE TRIGGER trg_rating_answers_eval
  AFTER INSERT OR UPDATE ON RATING_ANSWERS
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_criteria_for_answer();

CREATE TRIGGER trg_option_answers_eval
  AFTER INSERT OR UPDATE ON ANSWER_OPTIONS
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_criteria_for_answer();

-- 3. Create trigger to finalize submission outcome when dateSubmitted changes
CREATE TRIGGER trg_submissions_finalize
  AFTER UPDATE OF dateSubmitted ON SUBMISSIONS
  FOR EACH ROW
  WHEN (NEW.dateSubmitted IS NOT NULL)
