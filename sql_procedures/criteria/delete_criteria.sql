CREATE OR REPLACE PROCEDURE delete_criterion(p_criterion_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM CRITERIA
    WHERE criterionId = p_criterion_id;
END;
$$;