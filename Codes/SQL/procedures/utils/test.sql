CREATE EXTENSION IF NOT EXISTS plpgsql;

CREATE OR REPLACE FUNCTION test_plpgsql() 
  RETURNS TEXT
  LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'PL/pgSQL is working';
END;
$$;

SELECT test_plpgsql();


-- Insert a question of type RATING
-- Ensure pgcrypto is enabled for UUIDs
-- Enable pgcrypto if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create dummy client
INSERT INTO CLIENTS (clientId, name, company, contactEmail, contactPhone)
VALUES (
  gen_random_uuid(),
  '{"en": "Test Client", "ar": "عميل تجريبي"}',
  '{"en": "Test Co", "ar": "شركة الاختبار"}',
  'client@example.com',
  '1001001001'
);

-- Create project
INSERT INTO PROJECTS (projectId, clientId, name)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  (SELECT clientId FROM CLIENTS LIMIT 1),
  '{"en": "Demo Project", "ar": "مشروع تجريبي"}'
);

-- Create location
INSERT INTO LOCATIONS (locationId, name, projectId)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '{"en": "Main Site", "ar": "الموقع الرئيسي"}',
  '11111111-1111-1111-1111-111111111111'
);

-- Create form
INSERT INTO FORMS (formId, locationId)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222'
);

-- Create interview
INSERT INTO INTERVIEWS (interviewId, projectId)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111'
);

-- Insert question type
INSERT INTO QUESTION_TYPES (typeCode, description)
VALUES (
  'RATE',
  '{"en": "Rating", "ar": "تقييم"}'
)
ON CONFLICT DO NOTHING;

-- Create question
INSERT INTO QUESTIONS (questionId, typeCode, questionText, formId, interviewId)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'RATE',
  '{"en": "How do you rate the service?", "ar": "كيف تقيم الخدمة؟"}',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- Add criteria: pass if >= 4
INSERT INTO CRITERIA (criterionId, questionId, type, value)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '55555555-5555-5555-5555-555555555555',
  '>=',
  '4'
);

-- Create user
INSERT INTO USERS (userId, name, email, phone, role)
VALUES (
  '77777777-7777-7777-7777-777777777777',
  '{"en": "Test User", "ar": "مستخدم تجريبي"}',
  'test@example.com',
  '0500000000',
  'Supervisor'
);

-- Create submission
INSERT INTO SUBMISSIONS (submissionId, formId, userId, interviewId)
VALUES (
  '88888888-8888-8888-8888-888888888888',
  '33333333-3333-3333-3333-333333333333',
  '77777777-7777-7777-7777-777777777777',
  '44444444-4444-4444-4444-444444444444'
);

-- Insert answer
INSERT INTO ANSWERS (answerId, submissionId, questionId)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  '88888888-8888-8888-8888-888888888888',
  '55555555-5555-5555-5555-555555555555'
);

-- Trigger test: rating >= 4
INSERT INTO RATING_ANSWERS (answerId, rating)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  4
);

-- ✅ Check criteria results
SELECT * FROM CRITERIA_RESULTS
WHERE answerId = '99999999-9999-9999-9999-999999999999';
