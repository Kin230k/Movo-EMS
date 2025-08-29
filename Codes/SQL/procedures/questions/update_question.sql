CREATE OR REPLACE PROCEDURE update_question(p_auth_user_id UUID,
 p_question_id UUID,
 p_type_code VARCHAR(30) DEFAULT NULL,
 p_question_text TEXT DEFAULT NULL,  -- Changed from JSONB to TEXT
 p_form_id UUID DEFAULT NULL,
 p_interview_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_question');

UPDATE QUESTIONS
 SET
 typeCode = COALESCE(p_type_code, typeCode),
 questionText = COALESCE(p_question_text, questionText),  -- Now accepts TEXT
 formId = COALESCE(p_form_id, formId),
 interviewId = COALESCE(p_interview_id, interviewId)
 WHERE questionId = p_question_id;
END;
$$;