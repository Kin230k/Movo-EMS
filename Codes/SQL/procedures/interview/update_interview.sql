CREATE OR REPLACE PROCEDURE update_interview(
    p_interview_id UUID,
    p_project_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE INTERVIEWS
    SET projectId = p_project_id
    WHERE interviewId = p_interview_id;
END;
$$;