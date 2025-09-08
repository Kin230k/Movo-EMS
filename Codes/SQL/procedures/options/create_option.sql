CREATE OR REPLACE PROCEDURE create_option(p_auth_user_id UUID,
 p_option_text TEXT,  -- Changed from JSONB to TEXT
 p_question_id UUID,
 p_is_correct BOOLEAN,
 p_display_order INT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_option');

INSERT INTO OPTIONS (
 optionId,
 optionText,
 questionId,
 isCorrect,
 displayOrder
 ) VALUES (
 gen_random_uuid(),
 p_option_text,  -- Now accepts TEXT
 p_question_id,
 p_is_correct,
 p_display_order
 );
END;
$$;