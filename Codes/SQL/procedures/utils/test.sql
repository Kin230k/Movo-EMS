-- ############################################################
-- FULL TEST SCRIPT: SELF-CONTAINED SETUP & TESTS FOR ALL QUESTION TYPES
-- ############################################################

-- 0. Clear all tables
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

-- 1. Create minimal parent hierarchy

-- 1.1 CLIENT
INSERT INTO CLIENTS (clientId, name, company, contactEmail, contactPhone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '{"en":"Test Client","ar":"عميل"}',
  '{"en":"Test Co","ar":"شركة"}',
  'client@test.com',
  '0100000000'
);

-- 1.2 PROJECT
INSERT INTO PROJECTS (projectId, clientId, name)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '{"en":"Test Project","ar":"المشروع"}'
);

-- 1.3 LOCATION
INSERT INTO LOCATIONS (locationId, name, projectId)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '{"en":"Site","ar":"الموقع"}',
  '22222222-2222-2222-2222-222222222222'
);

-- 1.4 FORM
INSERT INTO FORMS (formId, locationId)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444'
);

-- 1.5 INTERVIEW
INSERT INTO INTERVIEWS (interviewId, projectId)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '22222222-2222-2222-2222-222222222222'
);

-- 1.6 USER
INSERT INTO USERS (userId, name, email, phone, role)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  '{"en":"Tester","ar":"مختبر"}',
  'user@test.com',
  '0550000000',
  'Supervisor'
);

-- 1.7 SUBMISSION
INSERT INTO SUBMISSIONS (submissionId, formId, userId, interviewId)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  '55555555-5555-5555-5555-555555555555',
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666'
);

-- 2. Define QUESTION_TYPES
INSERT INTO QUESTION_TYPES (typeCode, description) VALUES
  ('OPEN_ENDED',      '{"en":"Open ended","ar":"مفتوح"}'),
  ('SHORT_ANSWER',    '{"en":"Short answer","ar":"إجابة قصيرة"}'),
  ('NUMBER',          '{"en":"Number","ar":"رقم"}'),
  ('RATE',            '{"en":"Rating","ar":"تقييم"}'),
  ('DROPDOWN',        '{"en":"Dropdown","ar":"قائمة"}'),
  ('RADIO',           '{"en":"Radio","ar":"اختيار"}'),
  ('MULTIPLE_CHOICE', '{"en":"Multiple choice","ar":"اختيارات"}');

-- 3. TEST EACH QUESTION TYPE

-- 3.1 OPEN_ENDED: should PASS on "good"
INSERT INTO QUESTIONS(questionId,typeCode,questionText,formId,interviewId)
VALUES ('10000001-0001-4000-8000-000000000001','OPEN_ENDED',
  '{"en":"Say something good","ar":"قل شيئاً جيداً"}',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
INSERT INTO CRITERIA(criterionId,questionId,type,value,effect) VALUES
  ('20000001-0001-4000-8000-000000000001','10000001-0001-4000-8000-000000000001','contains','good','PASS'),
  ('20000001-0001-4000-8000-000000000002','10000001-0001-4000-8000-000000000001','contains','bad','FAIL');
INSERT INTO ANSWERS(answerId,submissionId,questionId)
VALUES ('30000001-0001-4000-8000-000000000001','88888888-8888-8888-8888-888888888888','10000001-0001-4000-8000-000000000001');
INSERT INTO TEXT_ANSWERS(answerId,response)
VALUES ('30000001-0001-4000-8000-000000000001','It was a good test.');
SELECT * FROM CRITERIA_RESULTS WHERE answerId='30000001-0001-4000-8000-000000000001';
SELECT * FROM ANSWER_RESULTS   WHERE answerId='30000001-0001-4000-8000-000000000001';

-- 3.1b OPEN_ENDED: should be MANUAL
INSERT INTO ANSWERS(answerId,submissionId,questionId)
VALUES (
  '30000001-0001-4000-8000-000000000009',
  '88888888-8888-8888-8888-888888888888',
  '10000001-0001-4000-8000-000000000001'
);
INSERT INTO TEXT_ANSWERS(answerId,response)
VALUES (
  '30000001-0001-4000-8000-000000000009',
  'just okay'
);
SELECT * FROM CRITERIA_RESULTS WHERE answerId='30000001-0001-4000-8000-000000000009';
SELECT * FROM ANSWER_RESULTS   WHERE answerId='30000001-0001-4000-8000-000000000009';

-- 3.2 SHORT_ANSWER: should PASS on "yes"
INSERT INTO QUESTIONS(questionId,typeCode,questionText,formId,interviewId)
VALUES ('10000001-0002-4000-8000-000000000002','SHORT_ANSWER',
  '{"en":"Shortly describe","ar":"وصف باختصار"}',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666'
);
INSERT INTO CRITERIA(criterionId,questionId,type,value,effect) VALUES
  ('20000001-0002-4000-8000-000000000003','10000001-0002-4000-8000-000000000002','contains','yes','PASS'),
  ('20000001-0002-4000-8000-000000000004','10000001-0002-4000-8000-000000000002','contains','no','FAIL');
INSERT INTO ANSWERS(answerId,submissionId,questionId)
VALUES ('30000001-0002-4000-8000-000000000002','88888888-8888-8888-8888-888888888888','10000001-0002-4000-8000-000000000002');
INSERT INTO TEXT_ANSWERS(answerId,response)
VALUES ('30000001-0002-4000-8000-000000000002','yes definitely');
SELECT * FROM CRITERIA_RESULTS WHERE answerId='30000001-0002-4000-8000-000000000002';
SELECT * FROM ANSWER_RESULTS   WHERE answerId='30000001-0002-4000-8000-000000000002';
