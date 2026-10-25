import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getUserStorageKey,
  createInitialStudentState,
  sanitizeStudentPayload,
} from './studentData';

test('getUserStorageKey generates distinct keys for distinct user IDs', () => {
  const key1 = getUserStorageKey('user_alpha_123');
  const key2 = getUserStorageKey('user_beta_456');
  const guestKey = getUserStorageKey(null);

  assert.equal(key1, 'c_tutor_user_state_user_alpha_123');
  assert.equal(key2, 'c_tutor_user_state_user_beta_456');
  assert.equal(guestKey, 'c_tutor_guest_state');
  assert.notEqual(key1, key2);
  assert.notEqual(key1, guestKey);
});

test('createInitialStudentState builds fresh isolated student profile without hardcoded names', () => {
  const state = createInitialStudentState({
    uid: 'student_xyz',
    email: 'newstudent@college.edu',
    name: 'Priya Sharma',
    college: 'IIT Delhi',
    branch: 'CSE',
  });

  assert.equal(state.profile.id, 'student_xyz');
  assert.equal(state.profile.name, 'Priya Sharma');
  assert.equal(state.profile.email, 'newstudent@college.edu');
  assert.equal(state.profile.college, 'IIT Delhi');
  assert.equal(state.xp, 0);
  assert.equal(state.level, 1);
  assert.equal(state.completedTopics.length, 0);
  assert.equal(state.savedPrograms.length, 0);
  assert.ok(state.studyTargets.length > 0);
  assert.ok(state.flashcards.length > 0);
});

test('sanitizeStudentPayload validates bounds and injects required fields for Firestore', () => {
  const state = createInitialStudentState({
    uid: 'student_999',
    email: 'test@example.com',
    name: 'Alex Rivera',
  });
  state.xp = 150;
  state.completedTopics = ['t1', 't2'];

  const payload = sanitizeStudentPayload(state, 'student_999');

  assert.equal(payload.userId, 'student_999');
  assert.equal(payload.email, 'test@example.com');
  assert.equal(payload.name, 'Alex Rivera');
  assert.equal(payload.xp, 150);
  assert.deepEqual(payload.completedTopics, ['t1', 't2']);
  assert.ok(payload.updatedAt);
});
