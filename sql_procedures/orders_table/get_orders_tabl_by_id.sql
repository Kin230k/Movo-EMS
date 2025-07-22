CREATE OR REPLACE FUNCTION get_order_table_entry_by_id(p_order_id INT)
RETURNS TABLE (orderId INT, orderDate DATE)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT ot.orderId, ot.orderDate
    FROM ORDERS_TABLE ot
    WHERE ot.orderId = p_order_id;
END;
$$;