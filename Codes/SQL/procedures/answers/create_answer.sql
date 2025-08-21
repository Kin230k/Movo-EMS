-- ============================================
-- PROCEDURE: CREATE_ANSWER
-- ============================================
CREATE OR REPLACE PROCEDURE create_answer(
    p_current_user_id UUID,
    p_answer_id UUID,
    p_submission_id UUID,
    p_question_id UUID,
    p_answered_at TIMESTAMP,
    p_answer_type TEXT,
    p_text_response TEXT,
    p_rating SMALLINT,
    p_numeric_response NUMERIC,
    p_option_ids UUID[]
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_type TEXT;
    v_subtypes_count INT;
    v_option_count INT;
BEGIN
    CALL check_user_permission(p_current_user_id, 'create_answer');
    
    IF p_answer_id IS NULL THEN RAISE EXCEPTION 'answerId is required'; END IF;
    IF p_submission_id IS NULL THEN RAISE EXCEPTION 'submissionId is required'; END IF;
    IF p_question_id IS NULL THEN RAISE EXCEPTION 'questionId is required'; END IF;

    -- Case-sensitive answerType
    IF p_answer_type IS NOT NULL THEN
        v_type := TRIM(p_answer_type);
        IF v_type NOT IN ('text','rating','numeric','options') THEN
            RAISE EXCEPTION 'invalid answerType: %, allowed (case-sensitive): text, rating, numeric, options', v_type;
        END IF;
    ELSE
        v_subtypes_count := (CASE WHEN p_text_response IS NOT NULL THEN 1 ELSE 0 END)
                        + (CASE WHEN p_rating IS NOT NULL THEN 1 ELSE 0 END)
                        + (CASE WHEN p_numeric_response IS NOT NULL THEN 1 ELSE 0 END)
                        + (CASE WHEN p_option_ids IS NOT NULL AND array_length(p_option_ids,1) > 0 THEN 1 ELSE 0 END);

        IF v_subtypes_count = 0 THEN
            RAISE EXCEPTION 'must provide one subtype value';
        ELSIF v_subtypes_count > 1 THEN
            RAISE EXCEPTION 'provide exactly one subtype value, not multiple';
        END IF;

        IF p_text_response IS NOT NULL THEN
            v_type := 'text';
        ELSIF p_rating IS NOT NULL THEN
            v_type := 'rating';
        ELSIF p_numeric_response IS NOT NULL THEN
            v_type := 'numeric';
        ELSE
            v_type := 'options';
        END IF;
    END IF;

    -- Validate rating
    IF v_type = 'rating' THEN
        IF p_rating IS NULL THEN RAISE EXCEPTION 'rating required'; END IF;
        IF p_rating < 1 OR p_rating > 5 THEN RAISE EXCEPTION 'rating must be between 1 and 5'; END IF;
    END IF;

    -- Validate options
    IF v_type = 'options' THEN
        IF p_option_ids IS NULL OR array_length(p_option_ids,1) = 0 THEN
            RAISE EXCEPTION 'optionIds required for options';
        END IF;

        SELECT COUNT(*) INTO v_option_count
        FROM OPTIONS o
        WHERE o.optionId = ANY(p_option_ids)
          AND o.questionId = p_question_id;

        IF v_option_count <> array_length(p_option_ids,1) THEN
            RAISE EXCEPTION 'one or more optionIds are invalid or do not belong to question %', p_question_id;
        END IF;
    END IF;

    -- Insert main answer
    INSERT INTO ANSWERS(answerId, submissionId, questionId, answeredAt)
    VALUES (p_answer_id, p_submission_id, p_question_id, COALESCE(p_answered_at, now()));

    -- Insert subtype
    IF v_type = 'text' THEN
        INSERT INTO TEXT_ANSWERS(answerId, response) VALUES (p_answer_id, p_text_response);
    ELSIF v_type = 'rating' THEN
        INSERT INTO RATING_ANSWERS(answerId, rating) VALUES (p_answer_id, p_rating);
    ELSIF v_type = 'numeric' THEN
        INSERT INTO NUMERIC_ANSWERS(answerId, response) VALUES (p_answer_id, p_numeric_response);
    ELSE
        INSERT INTO ANSWER_OPTIONS(answerOptionsId, answerId, optionId)
        SELECT gen_random_uuid(), p_answer_id, unnestVal
        FROM unnest(p_option_ids) AS unnestVal;
    END IF;
END;
$$;
