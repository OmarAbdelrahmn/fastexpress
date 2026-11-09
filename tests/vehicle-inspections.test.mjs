import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_FILE_SIZE_BYTES,
  validateInspectionFile,
  validateMileage,
  validateInspection,
  appendInspectionToFormData,
  resolveInspectionImageUrl,
  VehicleInspectionService,
} from '../src/lib/services/vehicleInspectionService.js';
import { ApiService } from '../src/lib/api/apiService.js';

// Helper to create mock file object
function createMockFile(name, size, type) {
  return {
    name,
    size,
    type,
  };
}

test('validateInspectionFile requires file and enforces 5MB limit and formats', () => {
  // Missing file
  assert.equal(validateInspectionFile(null).valid, false);

  // File > 5MB
  const tooBig = createMockFile('front.jpg', MAX_FILE_SIZE_BYTES + 1, 'image/jpeg');
  const tooBigRes = validateInspectionFile(tooBig);
  assert.equal(tooBigRes.valid, false);
  assert.match(tooBigRes.error, /exceeds 5 MB/i);

  // Valid formats under 5MB
  for (const [name, type] of [
    ['front.jpg', 'image/jpeg'],
    ['front.jpeg', 'image/jpeg'],
    ['front.png', 'image/png'],
    ['front.webp', 'image/webp'],
  ]) {
    const file = createMockFile(name, 1024 * 1024, type);
    assert.equal(validateInspectionFile(file).valid, true);
  }

  // Invalid format
  const badExt = createMockFile('document.pdf', 1024, 'application/pdf');
  assert.equal(validateInspectionFile(badExt).valid, false);
});

test('validateMileage requires non-negative number up to one decimal place', () => {
  // Missing or empty
  assert.equal(validateMileage(null).valid, false);
  assert.equal(validateMileage('').valid, false);
  assert.equal(validateMileage('   ').valid, false);

  // Negative
  assert.equal(validateMileage(-1).valid, false);
  assert.equal(validateMileage('-12.5').valid, false);

  // More than one decimal place
  assert.equal(validateMileage('123.45').valid, false);
  assert.equal(validateMileage('0.12').valid, false);

  // Non-numeric
  assert.equal(validateMileage('abc').valid, false);
  assert.equal(validateMileage('12km').valid, false);

  // Valid inputs
  assert.deepEqual(validateMileage(0), { valid: true, value: 0 });
  assert.deepEqual(validateMileage('0'), { valid: true, value: 0 });
  assert.deepEqual(validateMileage('1234'), { valid: true, value: 1234 });
  assert.deepEqual(validateMileage('1234.5'), { valid: true, value: 1234.5 });
  assert.deepEqual(validateMileage(1234.5), { valid: true, value: 1234.5 });
});

test('validateInspection validates all 5 photos and mileage', () => {
  const validMock = {
    frontImage: createMockFile('front.jpg', 1000, 'image/jpeg'),
    backImage: createMockFile('back.png', 1000, 'image/png'),
    rightImage: createMockFile('right.webp', 1000, 'image/webp'),
    leftImage: createMockFile('left.jpg', 1000, 'image/jpeg'),
    odometerImage: createMockFile('odo.jpg', 1000, 'image/jpeg'),
    mileageKm: '1234.5',
  };

  const validRes = validateInspection(validMock);
  assert.equal(validRes.valid, true);
  assert.deepEqual(validRes.errors, {});

  // Missing one photo
  const missingOne = { ...validMock, rightImage: null };
  const missingRes = validateInspection(missingOne);
  assert.equal(missingRes.valid, false);
  assert.ok(missingRes.errors.rightImage);

  // Invalid mileage
  const badMileage = { ...validMock, mileageKm: '12.345' };
  const badMileageRes = validateInspection(badMileage);
  assert.equal(badMileageRes.valid, false);
  assert.ok(badMileageRes.errors.mileageKm);
});

test('appendInspectionToFormData appends correct keys for Inspection and ReturnInspection', () => {
  const mockInspection = {
    frontImage: createMockFile('front.jpg', 1000, 'image/jpeg'),
    backImage: createMockFile('back.jpg', 1000, 'image/jpeg'),
    rightImage: createMockFile('right.jpg', 1000, 'image/jpeg'),
    leftImage: createMockFile('left.jpg', 1000, 'image/jpeg'),
    odometerImage: createMockFile('odo.jpg', 1000, 'image/jpeg'),
    mileageKm: 9876.5,
  };

  const form = new FormData();
  appendInspectionToFormData(form, mockInspection, 'Inspection');

  assert.ok(form.get('Inspection.FrontImage'));
  assert.ok(form.get('Inspection.BackImage'));
  assert.ok(form.get('Inspection.RightImage'));
  assert.ok(form.get('Inspection.LeftImage'));
  assert.ok(form.get('Inspection.OdometerImage'));
  assert.equal(form.get('Inspection.MileageKm'), '9876.5');

  appendInspectionToFormData(form, mockInspection, 'ReturnInspection');
  assert.ok(form.get('ReturnInspection.FrontImage'));
  assert.ok(form.get('ReturnInspection.BackImage'));
  assert.ok(form.get('ReturnInspection.RightImage'));
  assert.ok(form.get('ReturnInspection.LeftImage'));
  assert.ok(form.get('ReturnInspection.OdometerImage'));
  assert.equal(form.get('ReturnInspection.MileageKm'), '9876.5');
});

test('resolveInspectionImageUrl resolves relative API uploads against API origin', () => {
  const rel = '/uploads/vehicle-inspections/42/front.png';
  const resolved = resolveInspectionImageUrl(rel);
  assert.ok(resolved.endsWith('/uploads/vehicle-inspections/42/front.png'));
  assert.ok(resolved.startsWith('http://') || resolved.startsWith('https://'));

  // Absolute or data URLs remain untouched
  const abs = 'https://cdn.example.com/images/front.jpg';
  assert.equal(resolveInspectionImageUrl(abs), abs);

  const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
  assert.equal(resolveInspectionImageUrl(dataUri), dataUri);
});

test('VehicleInspectionService submits multipart form for member and admin endpoints', async () => {
  const originalPost = ApiService.post;
  const capturedCalls = [];

  ApiService.post = async (endpoint, data, params) => {
    capturedCalls.push({ endpoint, data, params });
    return { success: true };
  };

  try {
    const validSet = {
      frontImage: createMockFile('front.jpg', 1000, 'image/jpeg'),
      backImage: createMockFile('back.jpg', 1000, 'image/jpeg'),
      rightImage: createMockFile('right.jpg', 1000, 'image/jpeg'),
      leftImage: createMockFile('left.jpg', 1000, 'image/jpeg'),
      odometerImage: createMockFile('odo.jpg', 1000, 'image/jpeg'),
      mileageKm: '450.0',
    };

    // 1. Member take
    await VehicleInspectionService.submitMemberRequestTake({
      riderIqamaNo: '2345678901',
      vehiclePlate: '1234-ABC',
      reason: 'Shift start',
      inspection: validSet,
    });
    assert.equal(capturedCalls[0].endpoint, '/api/member/vehicles/request-take');
    assert.equal(capturedCalls[0].data.get('RiderIqamaNo'), '2345678901');
    assert.equal(capturedCalls[0].data.get('VehiclePlate'), '1234-ABC');
    assert.equal(capturedCalls[0].data.get('Reason'), 'Shift start');
    assert.ok(capturedCalls[0].data.get('Inspection.FrontImage'));

    // 2. Member switch (dual sets)
    await VehicleInspectionService.submitMemberRequestSwitch({
      riderIqamaNo: '2345678901',
      newVehiclePlate: '5678-XYZ',
      reason: 'Replacement car',
      inspection: validSet,
      returnInspection: validSet,
    });
    assert.equal(capturedCalls[1].endpoint, '/api/member/vehicles/request-switch-vehicel');
    assert.ok(capturedCalls[1].data.get('Inspection.FrontImage'));
    assert.ok(capturedCalls[1].data.get('ReturnInspection.FrontImage'));

    // 3. Admin take (query params + form body)
    await VehicleInspectionService.submitAdminTake({
      iqamaNo: '2345678901',
      vehicleNumber: '1234-ABC',
      reason: 'Direct handover',
      permission: 'PERM-001',
      inspection: validSet,
    });
    assert.equal(capturedCalls[2].endpoint, '/api/vehicles/take');
    assert.deepEqual(capturedCalls[2].params, {
      iqamaNo: '2345678901',
      vehicleNumber: '1234-ABC',
      reason: 'Direct handover',
      permission: 'PERM-001',
    });
    assert.ok(capturedCalls[2].data.get('Inspection.FrontImage'));

    // 4. Admin return
    await VehicleInspectionService.submitAdminReturn({
      iqamaNo: '2345678901',
      vehicleNumber: '1234-ABC',
      reason: 'Contract end',
      inspection: validSet,
    });
    assert.equal(capturedCalls[3].endpoint, '/api/vehicles/return');
    assert.equal(capturedCalls[3].params.vehicleNumber, '1234-ABC');
    assert.ok(capturedCalls[3].data.get('Inspection.FrontImage'));

    // 5. Admin switch (query params + dual form body)
    await VehicleInspectionService.submitAdminSwitch({
      iqamaNo: '2345678901',
      newVehiclePlate: '9999-ZZZ',
      reason: 'Upgrade',
      permission: 'PERM-002',
      inspection: validSet,
      returnInspection: validSet,
    });
    assert.equal(capturedCalls[4].endpoint, '/api/vehicles/switch');
    assert.equal(capturedCalls[4].params.newVehiclePlate, '9999-ZZZ');
    assert.ok(capturedCalls[4].data.get('Inspection.FrontImage'));
    assert.ok(capturedCalls[4].data.get('ReturnInspection.FrontImage'));
  } finally {
    ApiService.post = originalPost;
  }
});
