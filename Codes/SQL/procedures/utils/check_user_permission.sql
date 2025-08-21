CREATE OR REPLACE PROCEDURE check_user_permission(
    p_userId UUID,
    p_actionType VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_has_permission BOOLEAN;
    v_action_name_en TEXT;
    v_action_name_ar TEXT;
    v_error_msg TEXT;
BEGIN
    -- Get action names from ACTIONS table (note alias `a` and quoted column "displayName")
    SELECT 
        COALESCE(a."displayName"->>'en', INITCAP(REPLACE(p_actionType, '_', ' '))),
        COALESCE(a."displayName"->>'ar', 'إجراء غير معروف')
    INTO v_action_name_en, v_action_name_ar
    FROM ACTIONS a
    WHERE a."actionType" = p_actionType;

    -- Fallback if action not found
    IF NOT FOUND THEN
        v_action_name_en := INITCAP(REPLACE(p_actionType, '_', ' '));
        v_action_name_ar := 'إجراء غير معروف';
    END IF;

    -- Check permission
    SELECT EXISTS (
        SELECT 1
        FROM PROJECT_USER_ROLES pur
        JOIN ROLE_ACTIONS ra ON pur.roleId = ra.roleId
        JOIN ACTIONS a2 ON ra.actionId = a2.actionId
        WHERE pur.userId = p_userId
          AND a2."actionType" = p_actionType
    ) INTO v_has_permission;

    -- Construct bilingual error message
    IF NOT v_has_permission THEN
        v_error_msg := format(
            'You don''t have permission to %s | ليس لديك صلاحيات ل%s',
            lower(v_action_name_en),
            v_action_name_ar
        );

        RAISE EXCEPTION '%', v_error_msg
        USING DETAIL = format('UserID: %s | Action: %s', p_userId, p_actionType),
              HINT = 'Assign required role in PROJECT_USER_ROLES';
    END IF;
END;
$$;