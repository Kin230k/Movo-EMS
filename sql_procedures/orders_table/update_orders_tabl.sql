CREATE OR REPLACE PROCEDURE update_order_table_entry(
    p_order_id INT,
    p_order_date DATE
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE ORDERS_TABLE
    SET orderDate = p_order_date
    WHERE orderId = p_order_id;
END;
$$;