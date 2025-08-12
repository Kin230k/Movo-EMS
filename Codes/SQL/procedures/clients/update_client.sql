CREATE OR REPLACE PROCEDURE update_client(
    p_client_id UUID,
    p_name JSONB,
    p_logo VARCHAR(512),
    p_company JSONB,
    p_contact_email VARCHAR(255),
    p_contact_phone VARCHAR(20),
    p_status client_status,
    p_user_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE CLIENTS
    SET 
        name = p_name,
        logo = p_logo,
        company = p_company,
        contactEmail = p_contact_email,
        contactPhone = p_contact_phone,
        status = p_status,
        userId = p_user_id
    WHERE clientId = p_client_id;
END;
$$;