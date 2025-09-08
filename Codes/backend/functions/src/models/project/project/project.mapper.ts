import { Operation } from '../../operation.enum';
import { BaseMapper } from '../../base-mapper';
import { Project } from './project.class';
import type { QueryResult } from 'pg';
import pool from '../../../utils/pool';
import { Multilingual } from '../../multilingual.type';
import { CurrentUser } from '../../../utils/currentUser.class';
export interface ProjectWithClient extends Omit<Project, 'operation'> {
  clientName: Multilingual;
}
export class ProjectMapper extends BaseMapper<Project> {
  async save(entity: Project): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const op = entity.operation;
    const {
      projectId,
      clientId,
      name,
      badgeBackground,
      startingDate,
      endingDate,
      description,
    } = entity;

    // Validation
    if (!name) throw new Error('Project name is required');
    if (!startingDate) throw new Error('Starting date is required');

    if (op === Operation.UPDATE) {
      if (!projectId) throw new Error('Project ID is required for update');
      console.log('currentUserId', currentUserId);
      // Normal user update (must be owner)
      await pool.query(
        'CALL update_project_if_owner($1, $2, $3, $4, $5, $6, $7)',
        [
          currentUserId,
          projectId,
          name,
          badgeBackground,
          startingDate,
          endingDate,
          description,
        ]
      );
    } else {
      if (!clientId) throw new Error('Client ID is required');
      console.log('currentUserId', currentUserId);
      await pool.query('CALL create_project($1, $2, $3, $4, $5, $6, $7)', [
        currentUserId,
        clientId,
        name,
        badgeBackground,
        startingDate,
        endingDate,
        description,
      ]);
    }
  }

  // 👇 New method for admin-level updates
  async updateAsAdmin(entity: Project): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const {
      projectId,
      name,
      badgeBackground,
      startingDate,
      endingDate,
      description,
    } = entity;

    if (!projectId) throw new Error('Project ID is required for admin update');

    await pool.query('CALL update_project($1, $2, $3, $4, $5, $6, $7)', [
      currentUserId,
      projectId,
      name,
      badgeBackground,
      startingDate,
      endingDate,
      description,
    ]);
  }

  async getById(id: string): Promise<Project | null> {
    if (!id) throw new Error('Project ID is required');
    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_by_id($1)',
      [id]
    );
    return result.rows.length ? this.mapRowToEntity(result.rows[0]) : null;
  }
  async getInfoWithFormsById(projectId: string): Promise<any | null> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!projectId) throw new Error('Project ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_info_with_forms($1, $2)',
      [currentUserId, projectId]
    );

    if (!result.rows.length) return null;

    const firstRow = result.rows[0];

    const startingDate =
      firstRow.startingdate instanceof Date
        ? firstRow.startingdate.toISOString()
        : firstRow.startingdate !== null && firstRow.startingdate !== undefined
        ? String(firstRow.startingdate)
        : null;

    const endingDate =
      firstRow.endingdate instanceof Date
        ? firstRow.endingdate.toISOString()
        : firstRow.endingdate !== null && firstRow.endingdate !== undefined
        ? String(firstRow.endingdate)
        : null;

    // project-level formId (first seen where locationId is null)
    let projectFormId: string | null = null;

    // collect unique locations; do NOT modify name (keep DB value as-is)
    const locationMap = new Map<
      string,
      { locationId: string; name?: any; formId?: string | null }
    >();

    for (const row of result.rows) {
      // project-level form (no location)
      if (!row.locationid) {
        if (!projectFormId && row.formid) {
          projectFormId = String(row.formid);
        }
        continue;
      }

      const locId = String(row.locationid);
      if (!locationMap.has(locId)) {
        locationMap.set(locId, {
          locationId: locId,
          name: row.locationname === undefined ? undefined : row.locationname, // leave language object/string untouched
          formId: row.formid ? String(row.formid) : null,
        });
      } else {
        // prefer first seen formId for that location
        const existing = locationMap.get(locId)!;
        if (
          (existing.formId === null || existing.formId === undefined) &&
          row.formid
        ) {
          existing.formId = String(row.formid);
        }
      }
    }

    const locationsArray = locationMap.size
      ? Array.from(locationMap.values())
      : null;

    return {
      projectId: String(firstRow.projectid),
      name: firstRow.name, // multilingual object or string returned as-is
      description: firstRow.description ?? null,
      startingDate: startingDate ?? null,
      endingDate: endingDate ?? null,
      formId: projectFormId ?? null, // project-level form id (or null)
      locations: locationsArray, // array of { locationId, name, formId } or null
    };
  }

  async getAll(): Promise<Project[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_projects($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntity);
  }
  async getAllProjectWithClientName(): Promise<ProjectWithClient[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');

    const result = await pool.query('SELECT * FROM get_all_projects($1)', [
      currentUserId,
    ]);
    return result.rows.map(this.mapRowToEntityWithClient);
  }
  async getAllActive(): Promise<ProjectWithClient[]> {
    const result = await pool.query('SELECT * FROM get_active_projects()');
    return result.rows.map(this.mapRowToEntityWithClient);
  }
  async getByClient(clientId: string): Promise<Project[]> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!clientId) throw new Error('Client ID is required');

    const result: QueryResult = await pool.query(
      'SELECT * FROM get_project_by_client($1, $2)',
      [currentUserId, clientId]
    );
    return result.rows.map(this.mapRowToEntity);
  }

  async delete(id: string): Promise<void> {
    const currentUserId = CurrentUser.uuid;
    if (!currentUserId) throw new Error('Current user UUID is not set');
    if (!id) throw new Error('Project ID is required');

    await pool.query('CALL delete_project($1, $2)', [currentUserId, id]);
  }

  private mapRowToEntity = (row: any): Project => {
    const startingDate =
      row.startingdate instanceof Date
        ? row.startingdate.toISOString()
        : row.startingdate !== null && row.startingdate !== undefined
        ? String(row.startingdate)
        : undefined;

    const endingDate =
      row.endingdate instanceof Date
        ? row.endingdate.toISOString()
        : row.endingdate !== null && row.endingdate !== undefined
        ? String(row.endingdate)
        : undefined;

    return new Project(
      row.clientid,
      row.name,
      startingDate as string,
      row.projectid,
      row.badgebackground,
      endingDate as string | undefined,
      row.description
    );
  };

  private mapRowToEntityWithClient = (row: any): ProjectWithClient => {
    return {
      ...this.mapRowToEntity(row),
      clientName: row.clientname,
    };
  };
}

const projectMapper = new ProjectMapper();
export default projectMapper;
