CREATE OR REPLACE PROCEDURE create_order_table_entry(
    p_order_date DATE
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO ORDERS_TABLE (orderDate) 
    VALUES (p_order_date) 
    RETURNING *;
END;
$$;