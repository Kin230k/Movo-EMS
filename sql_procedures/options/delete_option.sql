CREATE OR REPLACE PROCEDURE delete_option(p_option_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM OPTIONS
    WHERE optionId = p_option_id;
END;
$$;