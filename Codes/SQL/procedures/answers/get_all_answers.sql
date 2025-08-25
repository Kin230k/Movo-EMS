-- ============================================
-- FUNCTION: GET_ALL_ANSWERS
-- ============================================
CREATE OR REPLACE FUNCTION get_all_answers(
  p_current_user_id UUID
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
         ta.response   AS textResponse,
         ra.rating     AS ratingValue,
         na.response   AS numericResponse,
         (SELECT array_agg(distinct ao.optionId) FROM ANSWER_OPTIONS ao WHERE ao.answerId = a.answerId) AS optionIds,
         (SELECT array_agg(distinct o.optionText) FROM ANSWER_OPTIONS ao JOIN OPTIONS o ON o.optionId = ao.optionId WHERE ao.answerId = a.answerId) AS optionTexts
  FROM ANSWERS a
  LEFT JOIN TEXT_ANSWERS    ta ON ta.answerId = a.answerId
  LEFT JOIN RATING_ANSWERS  ra ON ra.answerId = a.answerId
  LEFT JOIN NUMERIC_ANSWERS na ON na.answerId = a.answerId
  ORDER BY a.answeredAt DESC;
$$;
