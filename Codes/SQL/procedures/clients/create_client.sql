CREATE OR REPLACE PROCEDURE create_client(
    p_name JSONB,
    p_logo VARCHAR(512),
    p_company JSONB,
    p_contact_email VARCHAR(255),
    p_contact_phone VARCHAR(20)
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO CLIENTS (
        clientId,
        name, 
        logo, 
        company, 
        contactEmail, 
        contactPhone
    ) VALUES (
        gen_random_uuid(),
        p_name,
        p_logo,
        p_company,
        p_contact_email,
        p_contact_phone
    ) ;
END;
$$;