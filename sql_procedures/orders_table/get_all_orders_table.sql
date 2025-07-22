CREATE OR REPLACE FUNCTION get_all_order_table_entries()
RETURNS TABLE (orderId INT, orderDate DATE)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT ot.orderId, ot.orderDate
    FROM ORDERS_TABLE ot;
END;
$$;