CREATE OR REPLACE PROCEDURE delete_form(p_form_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM FORMS
    WHERE formId = p_form_id;
END;
$$;