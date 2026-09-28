import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeProcurementPayload } from './api.ts';

test('sanitizeProcurementPayload removes UI-only fields before saving to procurements', () => {
  const payload = sanitizeProcurementPayload({
    title: 'Sample procurement',
    office_id: 12,
    office_name: 'Ministry Office',
    ministry_id: 3,
    ministry_name: 'Ministry Name',
    province_id: 1,
    province_name: 'Bagmati',
    fiscal_year_id: 5,
    fiscal_year_name: '2083/84',
    contract_amount: 250000,
  });

  assert.equal(payload.office_id, 12);
  assert.equal('office_name' in payload, false);
  assert.equal('ministry_name' in payload, false);
  assert.equal('province_name' in payload, false);
  assert.equal('fiscal_year_name' in payload, false);
  assert.equal(payload.title, 'Sample procurement');
});
