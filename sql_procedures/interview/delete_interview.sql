CREATE OR REPLACE PROCEDURE delete_interview(p_interview_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM INTERVIEW
    WHERE interviewId = p_interview_id;
END;
$$;