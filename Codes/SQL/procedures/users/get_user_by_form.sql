CREATE OR REPLACE FUNCTION get_user_by_form(p_auth_user_id UUID,p_form_id UUID)
RETURNS TABLE (
    userId UUID,
    name JSONB,
    email VARCHAR(255),
    phone VARCHAR(20),
    picture VARCHAR(512),
    role user_role,
    status user_status,
    twoFaEnabled BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_user_by_form');

    RETURN QUERY
    SELECT 
        u.userId,
        u.name,
        u.email,
        u.phone,
        u.picture,
        u.role::user_role,     -- cast here
        u.status::user_status, -- cast here (if needed)
        u.twoFaEnabled
    FROM FORMS f
    INNER JOIN SUBMISSIONS s on s.formId=p_form_id
    INNER JOIN USERS u on s.userId=u.userId;
    WHERE f.formId=p_form_id
END;
$$;