DROP VIEW IF EXISTS v_project_user_attendances;
-- Create view without parameter filtering
CREATE OR REPLACE VIEW v_project_user_attendances AS
SELECT 
    u.userId,
    u.name,
    u.role::user_role,
    u.status::user_status as userStatus,
    u.picture,
    a.attendanceTimestamp,
    p.projectId,
    CASE 
        WHEN a.attendanceTimestamp IS NOT NULL THEN 'present' 
        ELSE 'absent' 
    END as attendanceStatus,
    a.attendanceId
FROM users u
LEFT JOIN attendances a ON u.userId = a.userId
INNER JOIN areas ar ON a.areaId = ar.areaId
INNER JOIN locations l ON ar.locationId = l.locationId
INNER JOIN projects p ON l.projectId = p.projectId