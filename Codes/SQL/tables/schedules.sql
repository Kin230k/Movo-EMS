CREATE TABLE SCHEDULES (
    scheduleId UUID PRIMARY KEY,
    createdAt DATE NOT NULL DEFAULT CURRENT_DATE,
    startTime TIMESTAMP NOT NULL ,
    endTime TIMESTAMP NOT NULL ,
    projectId UUID  REFERENCES PROJECTS(projectId) ON DELETE CASCADE ON UPDATE CASCADE,
    locationId UUID  REFERENCES LOCATIONS(locationId) ON DELETE CASCADE ON UPDATE CASCADE
  CHECK (
       (projectId  IS NOT NULL AND locationId IS     NULL)
    OR (projectId  IS     NULL AND locationId IS NOT NULL)
    )
    
);
;
-- 1) Safer multi-step conversion (recommended)
-- 0) prepare diagnostics table

CREATE TABLE IF NOT EXISTS conversion_errors_new (
  scheduleid UUID,
  col TEXT,
  raw_value TEXT,
  err TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 1) add new timestamp (no tz) columns (if not already added)ALTER TABLE schedules
ALTER TABLE schedules
  ALTER COLUMN starttime TYPE TIMESTAMP
  USING (createdat + starttime),
  ALTER COLUMN endtime TYPE TIMESTAMP
  USING (createdat + endtime);