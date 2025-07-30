CREATE OR REPLACE PROCEDURE delete_criterion_result(p_criterion_result_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM CRITERIA_RESULTS
    WHERE criterionResultId = p_criterion_result_id;
END;
$$;