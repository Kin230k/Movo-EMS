CREATE OR REPLACE FUNCTION get_all_options()
RETURNS TABLE (
    optionId UUID,
    optionText VARCHAR(500),
    questionId UUID,
    isCorrect BOOLEAN,
    displayOrder INT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        o.optionId,
        o.optionText,
        o.questionId,
        o.isCorrect,
        o.displayOrder
    FROM OPTIONS o;
END;
$$;