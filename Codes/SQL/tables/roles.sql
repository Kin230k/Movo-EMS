CREATE TABLE ROLES (
    roleId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    description JSONB CHECK (
        description IS NULL OR (
            description ? 'en' AND 
            description ? 'ar' AND
            jsonb_typeof(description->'en') = 'string' AND
            jsonb_typeof(description->'ar') = 'string'
        )
    )
);
INSERT INTO roles (roleid, name) VALUES
('89898989-1234-8989-8989-898989898989'::uuid, '{"en":"User","ar":"مستخدم"}'::jsonb),
('89898989-1235-8989-8989-898989898989'::uuid, '{"en":"Marshall","ar":"مارشال"}'::jsonb),
('89898989-1236-8989-8989-898989898989'::uuid, '{"en":"Supervisor","ar":"مشرف"}'::jsonb),
('89898989-1237-8989-8989-898989898989'::uuid, '{"en":"Senior Supervisor","ar":"مشرف سنوي"}'::jsonb),
('89898989-1238-8989-8989-898989898989'::uuid, '{"en":"Super Admin","ar":"مدير عام"}'::jsonb),
('89898989-1239-8989-8989-898989898989'::uuid, '{"en":"Main User","ar":"مستخدم رئيسي"}'::jsonb),
('89898989-1230-8989-8989-898989898989'::uuid, '{"en":"System Admin","ar":"مدير النظام"}'::jsonb);

