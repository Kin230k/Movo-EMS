CREATE OR REPLACE PROCEDURE update_client(p_auth_user_id UUID,
 p_client_id UUID,
 p_name JSONB DEFAULT NULL,
 p_logo VARCHAR(512) DEFAULT NULL,
 p_company JSONB DEFAULT NULL,
 p_contact_email VARCHAR(255) DEFAULT NULL,
 p_contact_phone VARCHAR(20) DEFAULT NULL,
  p_status client_status DEFAULT NULL

)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_client');

UPDATE CLIENTS
 SET
 name = COALESCE(p_name, name),
 logo = COALESCE(p_logo, logo),
 company = COALESCE(p_company, company),
 contactEmail = COALESCE(p_contact_email, contactEmail),
 contactPhone = COALESCE(p_contact_phone, contactPhone),
 status = COALESCE(p_status, status)
 WHERE clientId = p_client_id;
END;
$$;