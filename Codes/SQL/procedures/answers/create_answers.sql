-- create_answers: accepts a jsonb array of answers and returns UUID[] (same order)
CREATE OR REPLACE FUNCTION create_answers(
    p_current_user_id UUID,
    p_submission_id UUID,
    p_answers_jsonb JSONB  -- array of answer objects
)
RETURNS UUID[]
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    i INT;
    arr_len INT;
    rec JSONB;
    v_answer_id UUID;
    v_type TEXT;
    v_option_arr UUID[];
    v_option_count INT;
    v_answer_ids UUID[] := ARRAY[]::UUID[];
BEGIN
    CALL check_user_permission(p_current_user_id, 'create_answers');

    IF p_submission_id IS NULL THEN
        RAISE EXCEPTION 'submissionId is required';
    END IF;

    IF p_answers_jsonb IS NULL OR jsonb_typeof(p_answers_jsonb) <> 'array' THEN
        RAISE EXCEPTION 'p_answers_jsonb must be a jsonb array of answer objects';
    END IF;

    arr_len := jsonb_array_length(p_answers_jsonb);

    FOR i IN 0..arr_len-1 LOOP
        rec := p_answers_jsonb -> i;

        -- required questionId
        IF NOT (rec ? 'questionId') OR trim(coalesce(rec->>'questionId','')) = '' THEN
            RAISE EXCEPTION 'questionId is required for answer at index %', i;
        END IF;

        -- determine or validate answer type
        IF rec ? 'answerType' AND (rec->>'answerType') IS NOT NULL THEN
            v_type := trim(rec->>'answerType');
            IF v_type NOT IN ('text','rating','numeric','options') THEN
                RAISE EXCEPTION 'invalid answerType at index %: %', i, v_type;
            END IF;
        ELSE
            -- infer from provided subtype fields (keep same rules as single)
            v_type := NULL;
            IF rec ? 'textResponse' THEN
                v_type := 'text';
            ELSIF rec ? 'rating' THEN
                v_type := 'rating';
            ELSIF rec ? 'numericResponse' THEN
                v_type := 'numeric';
            ELSIF rec ? 'optionIds' THEN
                v_type := 'options';
            END IF;

            IF v_type IS NULL THEN
                RAISE EXCEPTION 'must provide one subtype value for answer at index %', i;
            END IF;
        END IF;

        -- rating validation
        IF v_type = 'rating' THEN
            IF NOT (rec ? 'rating') THEN
                RAISE EXCEPTION 'rating required for index %', i;
            END IF;
            IF (rec->>'rating')::INT < 1 OR (rec->>'rating')::INT > 5 THEN
                RAISE EXCEPTION 'rating must be between 1 and 5 at index %', i;
            END IF;
        END IF;

        -- options validation
        IF v_type = 'options' THEN
            IF NOT (rec ? 'optionIds') THEN
                RAISE EXCEPTION 'optionIds required for options at index %', i;
            END IF;

            -- convert jsonb array of optionIds into UUID[] (works for ["uuid","uuid"...])
            SELECT array_agg((value)::UUID)
            INTO v_option_arr
            FROM jsonb_array_elements_text(rec->'optionIds') AS t(value);

            IF v_option_arr IS NULL OR array_length(v_option_arr,1) = 0 THEN
                RAISE EXCEPTION 'optionIds must be a non-empty array at index %', i;
            END IF;

            -- verify options all belong to the provided questionId
            SELECT COUNT(*) INTO v_option_count
            FROM options o
            WHERE o.optionid = ANY(v_option_arr)
              AND o.questionid = (rec->>'questionId')::UUID;

            IF v_option_count <> array_length(v_option_arr,1) THEN
                RAISE EXCEPTION 'one or more optionIds are invalid or do not belong to question % (index %)', rec->>'questionId', i;
            END IF;
        END IF;

        -- create answer row
        INSERT INTO answers(answerid, submissionid, questionid, answeredat)
        VALUES (gen_random_uuid(), p_submission_id, (rec->>'questionId')::UUID, COALESCE(NULLIF(rec->>'answeredAt','')::timestamp, now()))
        RETURNING answerid INTO v_answer_id;

        -- insert subtype row
        IF v_type = 'text' THEN
            INSERT INTO text_answers(answerid, response)
            VALUES (v_answer_id, rec->>'textResponse');
        ELSIF v_type = 'rating' THEN
            INSERT INTO rating_answers(answerid, rating)
            VALUES (v_answer_id, (rec->>'rating')::SMALLINT);
        ELSIF v_type = 'numeric' THEN
            INSERT INTO numeric_answers(answerid, response)
            VALUES (v_answer_id, (rec->>'numericResponse')::NUMERIC);
        ELSE
            -- options: insert multiple answer_options rows
            -- v_option_arr already populated above
            INSERT INTO answer_options(answeroptionsid, answerid, optionid)
            SELECT gen_random_uuid(), v_answer_id, unnest_elem
            FROM unnest(v_option_arr) AS unnest_elem;
        END IF;

        -- append generated id to returned array
        v_answer_ids := v_answer_ids || v_answer_id;
    END LOOP;

    RETURN v_answer_ids;
END;
$$;
