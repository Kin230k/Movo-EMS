CREATE OR REPLACE PROCEDURE delete_user_project(p_auth_user_id UUID, p_user_project_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_user_project');

DELETE FROM USER_PROJECT
    WHERE userProjectId = p_user_project_id;
END;
$$;