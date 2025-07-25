CREATE OR REPLACE FUNCTION get_all_actions()
RETURNS TABLE (actionId UUID, actionType VARCHAR(100))
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.actionId,
        a.actionType
    FROM ACTIONS a;
END;
$$;