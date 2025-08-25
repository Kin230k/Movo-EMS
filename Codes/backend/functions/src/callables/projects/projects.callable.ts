// src/functions/callables.ts
import { onCall } from 'firebase-functions/v2/https';

// --- Project Handlers ---
import { createProjectHandler } from '../../handlers/projects/createProjectHandler';
import { deleteProjectHandler } from '../../handlers/projects/deleteProjectHandler';
import { getProjectByIdHandler } from '../../handlers/projects/getProjectByIdHandler';
import { updateProjectHandler } from '../../handlers/projects/updateProjectHandler';

// --- Location Handlers ---
import { createLocationHandler } from '../../handlers/projects/locations/createLocationHandler';
import { deleteLocationHandler } from '../../handlers/projects/locations/deleteLocationHandler';
import { getLocationByIdHandler } from '../../handlers/projects/locations/getLocationByIdHandler';
import { updateLocationHandler } from '../../handlers/projects/locations/updateLocationHandler';

// --- User Project Handlers ---
import { createUserProjectHandler } from '../../handlers/projects/user_project/createUserProjectHandler';
import { deleteUserProjectHandler } from '../../handlers/projects/user_project/deleteUserProjectHandler';
import { getUserProjectByIdHandler } from '../../handlers/projects/user_project/getUserProjectByIdHandler';
import { updateUserProjectHandler } from '../../handlers/projects/user_project/updateUserProjectHandler';

// --- Schedule Handlers ---
import { createScheduleHandler } from '../../handlers/projects/schedules/createScheduleHandler';
import { deleteScheduleHandler } from '../../handlers/projects/schedules/deleteScheduleHandler';
import { getScheduleByIdHandler } from '../../handlers/projects/schedules/getScheduleByIdHandler';
import { updateScheduleHandler } from '../../handlers/projects/schedules/updateScheduleHandler';

// --- User Schedule Handlers ---
import { createUserProjectWithScheduleHandler } from '../../handlers/projects/user_schedule/createUserProjectWithScheduleHandler';
import { updateUserProjectWithScheduleHandler } from '../../handlers/projects/user_schedule/updateUserProjectWithScheduleHandler';

// --- Attendance Handlers ---
import { createAttendanceHandler } from '../../handlers/projects/attendances/createAttendanceHandler';
import { deleteAttendanceHandler } from '../../handlers/projects/attendances/deleteAttendanceHandler';
import { getAttendanceByIdHandler } from '../../handlers/projects/attendances/getAttendanceByIdHandler';
import { updateAttendanceHandler } from '../../handlers/projects/attendances/updateAttendanceHandler';

// --- Area Handlers ---
import { createAreaHandler } from '../../handlers/projects/areas/createAreaHandler';
import { deleteAreaHandler } from '../../handlers/projects/areas/deleteAreaHandler';
import { getAreaByIdHandler } from '../../handlers/projects/areas/getAreaByIdHandler';
import { updateAreaHandler } from '../../handlers/projects/areas/updateAreaHandler';
import { getAreasByLocationHandler } from '../../handlers/projects/areas/getAreasByLocationHandler';
import { getAllAreasHandler } from '../../handlers/projects/areas/getAllAreasHandler';

// --- Project Callables ---
export const createProject = onCall(createProjectHandler);
export const deleteProject = onCall(deleteProjectHandler);
export const getProject = onCall(getProjectByIdHandler);
export const updateProject = onCall(updateProjectHandler);

// --- Location Callables ---
export const createLocation = onCall(createLocationHandler);
export const deleteLocation = onCall(deleteLocationHandler);
export const getLocation = onCall(getLocationByIdHandler);
export const updateLocation = onCall(updateLocationHandler);

// --- User Project Callables ---
export const createUserProject = onCall(createUserProjectHandler);
export const deleteUserProject = onCall(deleteUserProjectHandler);
export const getUserProject = onCall(getUserProjectByIdHandler);
export const updateUserProject = onCall(updateUserProjectHandler);

// --- Schedule Callables ---
export const createSchedule = onCall(createScheduleHandler);
export const deleteSchedule = onCall(deleteScheduleHandler);
export const getSchedule = onCall(getScheduleByIdHandler);
export const updateSchedule = onCall(updateScheduleHandler);

// --- User Schedule Callables ---
export const createUserSchedule = onCall(createUserProjectWithScheduleHandler);
export const updateUserSchedule = onCall(updateUserProjectWithScheduleHandler);

// --- Attendance Callables ---
export const createAttendance = onCall(createAttendanceHandler);
export const deleteAttendance = onCall(deleteAttendanceHandler);
export const getAttendance = onCall(getAttendanceByIdHandler);
export const updateAttendance = onCall(updateAttendanceHandler);



// --- Area Callables ---
export const createArea = onCall(createAreaHandler);
export const deleteArea = onCall(deleteAreaHandler);
export const getArea = onCall(getAreaByIdHandler);
export const updateArea = onCall(updateAreaHandler);
export const getAreasByLocation = onCall(getAreasByLocationHandler);
export const getAllAreas = onCall(getAllAreasHandler);