CREATE OR REPLACE PROCEDURE update_client(
    p_client_id UUID,
    p_name JSONB,
    p_logo VARCHAR(512),
    p_company JSONB,
    p_contact_email VARCHAR(255),
    p_contact_phone VARCHAR(20)
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE CLIENTS
    SET 
        name = p_name,
        logo = p_logo,
        company = p_company,
        contactEmail = p_contact_email,
        contactPhone = p_contact_phone
    WHERE clientId = p_client_id;
END;
$$;