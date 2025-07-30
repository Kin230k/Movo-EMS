CREATE OR REPLACE FUNCTION get_answer_option_by_id(p_answer_options_id UUID)
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
    FROM ANSWER_OPTIONS ao
    WHERE ao.answerOptionsId = p_answer_options_id;
END;
$$;