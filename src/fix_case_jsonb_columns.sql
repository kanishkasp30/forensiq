UPDATE cases SET timeline = '[]'::jsonb WHERE jsonb_typeof(timeline) = 'object';
UPDATE cases SET comments = '[]'::jsonb WHERE jsonb_typeof(comments) = 'object';
UPDATE cases SET evidence_files = '[]'::jsonb WHERE jsonb_typeof(evidence_files) = 'object';