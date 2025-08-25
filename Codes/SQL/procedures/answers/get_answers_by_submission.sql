
-- ============================================
-- FUNCTION: GET_ALL_ANSWERS (with submission filter)
-- ============================================
CREATE OR REPLACE FUNCTION get_all_answers(
    p_current_user_id UUID,
    p_submission_id UUID
)
RETURNS TABLE (
    answerId UUID,
    submissionId UUID,
    questionId UUID,
    answeredAt TIMESTAMP,
    answerType TEXT,
    textResponse TEXT,
    rating SMALLINT,
    numericResponse NUMERIC,
    optionIds UUID[]
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.answerId,
        a.submissionId,
        a.questionId,
        a.answeredAt,
        CASE 
            WHEN ta.answerId IS NOT NULL THEN 'text'
            WHEN ra.answerId IS NOT NULL THEN 'rating'
            WHEN na.answerId IS NOT NULL THEN 'numeric'
            WHEN ao.answerId IS NOT NULL THEN 'options'
        END AS answerType,
        ta.response       AS textResponse,
        ra.rating         AS rating,
        na.response       AS numericResponse,
        ARRAY_AGG(ao.optionId) FILTER (WHERE ao.optionId IS NOT NULL) AS optionIds
    FROM ANSWERS a
    LEFT JOIN TEXT_ANSWERS ta   ON a.answerId = ta.answerId
    LEFT JOIN RATING_ANSWERS ra ON a.answerId = ra.answerId
    LEFT JOIN NUMERIC_ANSWERS na ON a.answerId = na.answerId
    LEFT JOIN ANSWER_OPTIONS ao  ON a.answerId = ao.answerId
    WHERE a.submissionId = p_submission_id
    GROUP BY a.answerId, a.submissionId, a.questionId, a.answeredAt, ta.response, ra.rating, na.response;
END;
$$;

-- ============================================
-- FUNCTION: GET_ALL_ANSWERS_BY_SUBMISSION
-- ============================================
CREATE OR REPLACE FUNCTION get_all_answers_by_submission(
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
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT a.answerId,
         a.submissionId,
         a.questionId,
         a.answeredAt,
         ta.response AS textResponse,
         ra.rating AS ratingValue,
         na.response AS numericResponse,
         (SELECT array_agg(distinct ao.optionId)
          FROM ANSWER_OPTIONS ao
          WHERE ao.answerId = a.answerId) AS optionIds,
         (SELECT array_agg(distinct o.optionText)
          FROM ANSWER_OPTIONS ao
          JOIN OPTIONS o ON o.optionId = ao.optionId
          WHERE ao.answerId = a.answerId) AS optionTexts
  FROM ANSWERS a
  LEFT JOIN TEXT_ANSWERS ta ON ta.answerId = a.answerId
  LEFT JOIN RATING_ANSWERS ra ON ra.answerId = a.answerId
  LEFT JOIN NUMERIC_ANSWERS na ON na.answerId = a.answerId
  WHERE a.submissionId = p_submission_id
  ORDER BY a.answeredAt DESC;
$$;
