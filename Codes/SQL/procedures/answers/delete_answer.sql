-- ============================================
-- PROCEDURE: DELETE_ANSWER
-- ============================================
CREATE OR REPLACE PROCEDURE delete_answer(
  p_current_user_id UUID,
  p_answer_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_exists INT;
BEGIN
  CALL check_user_permission(p_current_user_id, 'delete_answer');
  
  IF p_answer_id IS NULL THEN RAISE EXCEPTION 'answerId is required'; END IF;

  SELECT COUNT(*) INTO v_exists FROM ANSWERS WHERE answerId = p_answer_id;
  IF v_exists = 0 THEN RAISE EXCEPTION 'answer with id % does not exist', p_answer_id; END IF;

  DELETE FROM ANSWERS WHERE answerId = p_answer_id;
END;
$$;
