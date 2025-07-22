CREATE OR REPLACE PROCEDURE delete_order_table_entry(p_order_id INT)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ORDERS_TABLE
    WHERE orderId = p_order_id;
END;
$$;