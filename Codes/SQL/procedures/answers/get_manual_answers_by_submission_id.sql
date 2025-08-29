CREATE OR REPLACE FUNCTION get_manual_answers_by_submission(
    p_current_user_id UUID,
    p_submission_id UUID
)
RETURNS TABLE (
    answerId UUID,
    submissionId UUID,
    questionId UUID,
    answeredAt TIMESTAMP,
    textResponse TEXT,
    ratingValue SMALLINT,
    numericResponse NUMERIC,
    optionIds UUID[],
    optionTexts JSONB[]
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    CALL check_user_permission(p_current_user_id, 'get_manual_answers_by_submission');
    
    RETURN QUERY
    SELECT a.answerId,
           a.submissionId,
           a.questionId,
           a.answeredAt,
           ta.response AS textResponse,
           ra.rating AS ratingValue,
           na.response AS numericResponse,
           (SELECT array_agg(DISTINCT ao.optionId)
            FROM ANSWER_OPTIONS ao
            WHERE ao.answerId = a.answerId) AS optionIds,
           (SELECT array_agg(DISTINCT o.optionText)
            FROM ANSWER_OPTIONS ao
            JOIN OPTIONS o ON o.optionId = ao.optionId
            WHERE ao.answerId = a.answerId) AS optionTexts
    FROM ANSWERS a
    INNER JOIN SUBMISSIONS s ON a.submissionId = s.submissionId
    LEFT JOIN TEXT_ANSWERS ta ON ta.answerId = a.answerId
    LEFT JOIN RATING_ANSWERS ra ON ra.answerId = a.answerId
    LEFT JOIN NUMERIC_ANSWERS na ON na.answerId = a.answerId 
    LEFT JOIN answer_results ar ON ar.answerId = a.answerId
    WHERE s.submissionId = p_submission_id 
      AND ar.outcome = 'MANUAL'
    ORDER BY a.answeredAt DESC;
END;
$$;