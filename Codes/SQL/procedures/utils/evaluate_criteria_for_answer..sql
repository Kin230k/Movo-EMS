CREATE OR REPLACE FUNCTION evaluate_criteria_for_answer()
RETURNS TRIGGER AS $$
DECLARE
    answer_data     RECORD;
    criterion       RECORD;
    passed          BOOLEAN;
    question_type_code TEXT;
    option_text_val TEXT;
BEGIN
    -- Get question type for the answer
    SELECT q.typeCode INTO question_type_code
    FROM QUESTIONS q
    JOIN ANSWERS a ON q.questionId = a.questionId
    WHERE a.answerId = NEW.answerId;

    -- Evaluate all criteria for this question
    FOR criterion IN 
        SELECT c.* 
        FROM CRITERIA c
        WHERE c.questionId = (
            SELECT questionId 
            FROM ANSWERS 
            WHERE answerId = NEW.answerId
        )
    LOOP
        passed := FALSE;

        -- Handle different answer types
        CASE 
            WHEN question_type_code IN ('OPEN_ENDED', 'SHORT_ANSWER') THEN
                SELECT response INTO answer_data 
                FROM TEXT_ANSWERS 
                WHERE answerId = NEW.answerId;

                passed := evaluate_text_criteria(
                    criterion.type, 
                    criterion.value, 
                    answer_data.response
                );

            WHEN question_type_code = 'NUMBER' THEN
                SELECT response INTO answer_data 
                FROM NUMERIC_ANSWERS 
                WHERE answerId = NEW.answerId;

                passed := evaluate_numeric_criteria(
                    criterion.type, 
                    criterion.value, 
                    answer_data.response
                );

            WHEN question_type_code = 'RATE' THEN
                SELECT rating INTO answer_data 
                FROM RATING_ANSWERS 
                WHERE answerId = NEW.answerId;

                passed := evaluate_numeric_criteria(
                    criterion.type, 
                    criterion.value, 
                    answer_data.rating::NUMERIC
                );

            WHEN question_type_code IN ('DROPDOWN', 'RADIO') THEN
                SELECT o.optionText->>current_setting('app.locale', true)
                INTO option_text_val
                FROM ANSWER_OPTIONS ao
                JOIN OPTIONS o ON ao.optionId = o.optionId
                WHERE ao.answerId = NEW.answerId
                LIMIT 1;

                passed := evaluate_text_criteria(
                    criterion.type, 
                    criterion.value, 
                    option_text_val
                );

            WHEN question_type_code = 'MULTIPLE_CHOICE' THEN
                SELECT STRING_AGG(
                    o.optionText->>current_setting('app.locale', true),
                    ','
                )
                INTO option_text_val
                FROM ANSWER_OPTIONS ao
                JOIN OPTIONS o ON ao.optionId = o.optionId
                WHERE ao.answerId = NEW.answerId;

                passed := evaluate_text_criteria(
                    criterion.type, 
                    criterion.value, 
                    option_text_val
                );
        END CASE;

        -- Insert result
        INSERT INTO CRITERIA_RESULTS (
            criterionResultId, answerId, criterionId, passed
        ) VALUES (
            gen_random_uuid(), NEW.answerId, criterion.criterionId, passed
        );
    END LOOP;

    -- Update submission outcome
    PERFORM update_submission_outcome(
        (SELECT submissionId FROM ANSWERS WHERE answerId = NEW.answerId)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
