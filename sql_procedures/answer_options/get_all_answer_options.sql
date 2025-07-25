CREATE OR REPLACE FUNCTION get_all_answer_options()
RETURNS TABLE (
    answerOptionsId UUID,
    answerId UUID,
    optionId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        ao.answerOptionsId,
        ao.answerId,
        ao.optionId
    FROM ANSWER_OPTIONS ao;
END;
$$;