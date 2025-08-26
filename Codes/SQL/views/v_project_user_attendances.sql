-- Create view without parameter filtering
CREATE OR REPLACE VIEW v_project_user_attendances AS
SELECT 
    u.userId,
    u.name,
    u.role,
    u.status as userStatus,
    u.picture,
    a.attendanceTimestamp,
    up.projectId,
    CASE 
        WHEN a.attendanceTimestamp IS NOT NULL THEN 'present' 
        ELSE 'absent' 
    END as attendanceStatus
FROM users u
INNER JOIN user_project up ON u.userId = up.userId
LEFT JOIN attendances a ON u.userId = a.userId;