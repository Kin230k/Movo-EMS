CREATE OR REPLACE FUNCTION evaluate_text_criteria(
    op              criteria_operator,
    criterion_value TEXT,
    answer_value    TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN CASE op
        WHEN '='        THEN answer_value = criterion_value
        WHEN '!='       THEN answer_value <> criterion_value
        WHEN 'contains' THEN answer_value ILIKE '%' || criterion_value || '%'
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql;