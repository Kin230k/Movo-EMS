CREATE TABLE USERS (
    userId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    email VARCHAR(255)  UNIQUE,
    phone VARCHAR(20)  UNIQUE,
    picture VARCHAR(512),
    role user_role NOT NULL,
    status user_status NOT NULL DEFAULT 'Active',
    twoFaEnabled BOOLEAN NOT NULL DEFAULT FALSE
     CONSTRAINT chk_email_or_phone CHECK (
        email IS NOT NULL OR phone IS NOT NULL
    )
);