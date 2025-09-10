-- ############################################################
-- FULL TEST SCRIPT: SELF-CONTAINED SETUP & TESTS FOR ALL QUESTION TYPES
-- ############################################################

-- 0. Clear all tables
ROLLBACK;
DO $$
DECLARE 
    tables TEXT;
BEGIN
    SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
    INTO tables
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    
    IF tables IS NOT NULL THEN
        EXECUTE 'TRUNCATE ' || tables || ' RESTART IDENTITY CASCADE';
    END IF;
END $$;

-- DEMO DATA SCRIPT (roles UUIDs set to your base case)
BEGIN;

-- ROLES (base case you provided)
INSERT INTO roles (roleid, name) VALUES
('89898989-1234-8989-8989-898989898989'::uuid, '{"en":"User","ar":"مستخدم"}'::jsonb),
('89898989-1235-8989-8989-898989898989'::uuid, '{"en":"Marshall","ar":"مارشال"}'::jsonb),
('89898989-1236-8989-8989-898989898989'::uuid, '{"en":"Supervisor","ar":"مشرف"}'::jsonb),
('89898989-1237-8989-8989-898989898989'::uuid, '{"en":"Senior Supervisor","ar":"مشرف سنوي"}'::jsonb),
('89898989-1238-8989-8989-898989898989'::uuid, '{"en":"Super Admin","ar":"مدير عام"}'::jsonb),
('89898989-1239-8989-8989-898989898989'::uuid, '{"en":"Main User","ar":"مستخدم رئيسي"}'::jsonb),
('89898989-1230-8989-8989-898989898989'::uuid, '{"en":"System Admin","ar":"مدير النظام"}'::jsonb);

-- CLIENTS
INSERT INTO clients (clientid, name, logo, company, contactemail, contactphone, status)
VALUES
('11111111-1111-1111-1111-111111111111'::uuid, '{"en":"Acme Corp","ar":"شركة أكمي"}'::jsonb, NULL, '{"industry":"Construction","size":"SMB"}'::jsonb, 'contact@acme.example', '+10000000001', 'accepted'),
('22222222-2222-2222-2222-222222222222'::uuid, '{"en":"Beta LLC","ar":"شركة بيتا"}'::jsonb, NULL, '{"industry":"Logistics"}'::jsonb, 'hello@beta.example', '+10000000002', 'pending');

-- PROJECTS
INSERT INTO projects (projectid, clientid, name, badgebackground, startingdate, endingdate, description)
VALUES
('33333333-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '{"en":"West Site","ar":"الموقع الغربي"}'::jsonb, NULL, '2025-01-01', '2025-12-31', '{"en":"Main west construction site","ar":"الموقع الغربي الرئيسي"}'::jsonb),
('44444444-4444-4444-4444-444444444444'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '{"en":"East Depot","ar":"المستودع الشرقي"}'::jsonb, NULL, '2025-06-01', '2026-05-31', NULL);

-- LOCATIONS
INSERT INTO locations (locationid, name, projectid, sitemap, longitude, latitude)
VALUES
('55555555-5555-5555-5555-555555555555'::uuid, '{"en":"West Gate","ar":"البوابة الغربية"}'::jsonb, '33333333-3333-3333-3333-333333333333'::uuid, NULL, 24.7136, 46.6753),
('66666666-6666-6666-6666-666666666666'::uuid, '{"en":"East Yard","ar":"الفناء الشرقي"}'::jsonb, '44444444-4444-4444-4444-444444444444'::uuid, NULL, 25.2854, 51.5310);

-- AREAS
INSERT INTO areas (areaid, name, locationid)
VALUES
('77777777-7777-7777-7777-777777777777'::uuid, '{"en":"Gate 1","ar":"البوابة 1"}'::jsonb, '55555555-5555-5555-5555-555555555555'::uuid);

-- USERS
-- NOTE: replaced textual role names with the corresponding role UUIDs
INSERT INTO users (userid, name, email, phone, picture, role, status, twofaenabled)
VALUES
('88888888-8888-8888-8888-888888888888'::uuid, '{"en":"Ali Ahmed","ar":"علي أحمد"}'::jsonb, 'ali@example.com', '+10000000011', NULL, '89898989-1234-8989-8989-898989898989'::uuid, 'Active', FALSE),
('99999999-9999-9999-9999-999999999999'::uuid, '{"en":"Nora Saleh","ar":"نورا صالح"}'::jsonb, 'nora@example.com', '+10000000012', NULL, '89898989-1236-8989-8989-898989898989'::uuid, 'Active', TRUE),
('12121212-1212-1212-1212-121212121212'::uuid, '{"en":"Sam Admin","ar":"سام أدمن"}'::jsonb, 'sam@example.com', '+10000000013', NULL, '89898989-1230-8989-8989-898989898989'::uuid, 'Active', TRUE);

-- PROJECT_USER_ROLES (use your role UUIDs)
INSERT INTO project_user_roles (projectuserroleid, userid, projectid, roleid, createdat, updatedat)
VALUES
('aaaaaaaa-0000-0000-0000-aaaaaaaaaaaa'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '89898989-1234-8989-8989-898989898989'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bbbbbbbb-0000-0000-0000-bbbbbbbbbbbb'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '89898989-1236-8989-8989-898989898989'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cccccccc-0000-0000-0000-cccccccccccc'::uuid, '12121212-1212-1212-1212-121212121212'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, '89898989-1230-8989-8989-898989898989'::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- FORMS
INSERT INTO forms (formid, projectid, locationid, form_language, form_title)
VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, NULL, 'en', 'Daily Site Checklist'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, NULL, '66666666-6666-6666-6666-666666666666'::uuid, 'ar', 'قائمة التحقق اليومية');

-- INTERVIEWS
INSERT INTO interviews (interviewid, projectid, title)
VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'Safety Interview');

-- QUESTIONS
INSERT INTO questions (questionid, typecode, questiontext, formid, interviewid)
VALUES
('0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a0a'::uuid, 'SHORT_ANSWER', 'What is the operator ID?', 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, NULL),
('0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b0b'::uuid, 'RATE', 'Rate site cleanliness (1-5)', 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, NULL),
('0c0c0c0c-0c0c-0c0c-0c0c-0c0c0c0c0c0c'::uuid, 'MULTIPLE_CHOICE', 'Which hardhats present?', NULL, 'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid);

-- OPTIONS
INSERT INTO options (optionid, optiontext, questionid, iscorrect, displayorder)
VALUES
('aaaa1111-aaaa-1111-aaaa-111111111111'::uuid, 'Standard hardhat', '0c0c0c0c-0c0c-0c0c-0c0c-0c0c0c0c0c0c'::uuid, TRUE, 1),
('bbbb2222-bbbb-2222-bbbb-222222222222'::uuid, 'Reflective hardhat', '0c0c0c0c-0c0c-0c0c-0c0c-0c0c0c0c0c0c'::uuid, FALSE, 2);

-- SUBMISSION
INSERT INTO submissions (submissionid, formid, userid, interviewid, datesubmitted, outcome, decisionnotes, answer_count, correct_answer_count)
VALUES
('ffffffff-0000-1111-2222-333333333333'::uuid, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, NULL, CURRENT_TIMESTAMP, 'MANUAL_REVIEW', 'Initial demo submission', 3, 1);

-- ANSWERS
INSERT INTO answers (answerid, submissionid, questionid, answeredat)
VALUES
('aaaa0000-1111-2222-3333-444444444444'::uuid, 'ffffffff-0000-1111-2222-333333333333'::uuid, '0a0a0a0a-0a0a-0a0a-0a0a-0a0a0a0a0a0a'::uuid, CURRENT_TIMESTAMP),
('bbbb0000-1111-2222-3333-555555555555'::uuid, 'ffffffff-0000-1111-2222-333333333333'::uuid, '0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b0b'::uuid, CURRENT_TIMESTAMP),
('cccc0000-1111-2222-3333-666666666666'::uuid, 'ffffffff-0000-1111-2222-333333333333'::uuid, '0c0c0c0c-0c0c-0c0c-0c0c-0c0c0c0c0c0c'::uuid, CURRENT_TIMESTAMP);

-- TEXT_ANSWERS
INSERT INTO text_answers (answerid, response)
VALUES
('aaaa0000-1111-2222-3333-444444444444'::uuid, 'OP-12345');

-- RATING_ANSWERS
INSERT INTO rating_answers (answerid, rating)
VALUES
('bbbb0000-1111-2222-3333-555555555555'::uuid, 4);

-- ANSWER_OPTIONS (UUID fixed)
INSERT INTO answer_options (answeroptionsid, answerid, optionid)
VALUES
('aaaa9999-aaaa-0000-0000-aaaaaaaaaaaa'::uuid, 'cccc0000-1111-2222-3333-666666666666'::uuid, 'aaaa1111-aaaa-1111-aaaa-111111111111'::uuid);

-- CRITERIA
INSERT INTO criteria (criterionid, type, value, questionid, effect)
VALUES
('ddddcccc-9999-8888-7777-666655554444'::uuid, '>'::criteria_operator, '3', '0b0b0b0b-0b0b-0b0b-0b0b-0b0b0b0b0b0b'::uuid, 'PASS');

-- DECISION_RULES
INSERT INTO decision_rules (ruleid, name, description, formid, priority, outcomeonpass, outcomeonfail)
VALUES
('eeeeeeee-2222-3333-4444-555555555555'::uuid, '{"en":"Cleanliness Rule","ar":"قاعدة النظافة"}'::jsonb, '{"en":"If cleanliness rating > 3 accept","ar":"اذا كانت النظافة > 3 اقبل"}'::jsonb, 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 10, 'ACCEPTED', 'REJECTED');

-- RULE_CRITERIA
INSERT INTO rule_criteria (ruleid, criterionid, required)
VALUES
('eeeeeeee-2222-3333-4444-555555555555'::uuid, 'ddddcccc-9999-8888-7777-666655554444'::uuid, TRUE);

-- ANSWER_RESULTS (idempotent upsert to avoid duplicate-key errors)
INSERT INTO answer_results (answerresultid, answerid, outcome)
VALUES
('99990000-1111-2222-3333-333333333333'::uuid, 'bbbb0000-1111-2222-3333-555555555555'::uuid, 'PASSED')
ON CONFLICT (answerid) DO UPDATE
  SET outcome = EXCLUDED.outcome,
      answerresultid = EXCLUDED.answerresultid;

-- CRITERIA_RESULTS (upsert on primary key)
INSERT INTO criteria_results (criterionresultid, answerid, criterionid, outcome, evaluatedat)
VALUES
('99990001-1111-2222-3333-333333333333'::uuid, 'bbbb0000-1111-2222-3333-555555555555'::uuid, 'ddddcccc-9999-8888-7777-666655554444'::uuid, 'PASSED', CURRENT_TIMESTAMP)
ON CONFLICT (criterionresultid) DO UPDATE
  SET answerid = EXCLUDED.answerid,
      criterionid = EXCLUDED.criterionid,
      outcome = EXCLUDED.outcome,
      evaluatedat = EXCLUDED.evaluatedat;

-- Update submission outcome (demo)
UPDATE submissions
SET outcome = 'ACCEPTED', decisionnotes = coalesce(decisionnotes, '') || ' Rule Cleanliness passed; auto-accepted.', correct_answer_count = 1
WHERE submissionid = 'ffffffff-0000-1111-2222-333333333333'::uuid;

-- ACTIONS
-- Changed column name from actiontype -> type, and made upsert in case script re-runs



-- ADMINS and ADMINS_ROLES (UUID fixed)
INSERT INTO admins (adminid, name, qid, dateofbirth, jobposition)
VALUES
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'::uuid, '{"en":"System Admin","ar":"مدير النظام"}'::jsonb, 'ADM001', '1985-05-10', 'Platform Admin');


-- EMAILS (UUID fixed)
INSERT INTO emails (emailid, title, body, formid)
VALUES
('55550000-1111-2222-0000-333333333333'::uuid, 'Submission Accepted', 'Your submission has been accepted. Thank you.', 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid);

-- ENDPOINT
INSERT INTO endpoint (type, endpoint_text)
VALUES ('webhook', 'https://example.com/webhook');

-- SCHEDULES (UUID fixed)
INSERT INTO schedules (scheduleid, createdat, starttime, endtime, projectid, locationid)
VALUES
('44440000-1111-2222-3333-333333333333'::uuid, CURRENT_DATE, NOW(), NOW() + INTERVAL '8 hours', '33333333-3333-3333-3333-333333333333'::uuid, NULL);

-- ATTENDANCES (UUID fixed)
INSERT INTO attendances (attendanceid, attendancetimestamp, signedwith, signedby, userid, areaid)
VALUES
('33330000-1111-2222-0000-333333333333'::uuid, CURRENT_TIMESTAMP, 'MANUAL', '99999999-9999-9999-9999-999999999999'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, '77777777-7777-7777-7777-777777777777'::uuid);

-- RATES (UUID fixed)
INSERT INTO rates (rateid, hourlyrate, userid, projectid)
VALUES
('22220000-1111-2222-0000-333333333333'::uuid, 25.50, '88888888-8888-8888-8888-888888888888'::uuid, '33333333-3333-3333-3333-333333333333'::uuid);

COMMIT;


