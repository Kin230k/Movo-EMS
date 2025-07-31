CREATE OR REPLACE PROCEDURE delete_rate(p_rate_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM RATES
    WHERE rateId = p_rate_id;
END;
$$;