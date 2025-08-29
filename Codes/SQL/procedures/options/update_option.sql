CREATE OR REPLACE PROCEDURE update_option(p_auth_user_id UUID,
 p_option_id UUID,
 p_option_text TEXT DEFAULT NULL,  -- Changed from JSONB to TEXT
 p_question_id UUID DEFAULT NULL,
 p_is_correct BOOLEAN DEFAULT NULL,
 p_display_order INT DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_option');

-- Validate display order only when provided
 IF p_display_order IS NOT NULL AND p_display_order < 0 THEN
 RAISE EXCEPTION 'Display order cannot be negative (provided: %)', p_display_order;
 END IF;

 UPDATE OPTIONS
 SET
 optionText = COALESCE(p_option_text, optionText),  -- Now accepts TEXT
 questionId = COALESCE(p_question_id, questionId),
 isCorrect = COALESCE(p_is_correct, isCorrect),
 displayOrder = COALESCE(p_display_order, displayOrder)
 WHERE optionId = p_option_id;
END;
$$;