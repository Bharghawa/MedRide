import { IS_DEMO_MODE, app, auth, db } from '../../src/config/firebase';

describe('Firebase Config', () => {
  it('should be in demo mode with placeholder keys', () => {
    expect(IS_DEMO_MODE).toBe(true);
  });

  it('should NOT initialize Firebase in demo mode', () => {
    expect(app).toBeNull();
    expect(auth).toBeNull();
    expect(db).toBeNull();
  });

  it('should export IS_DEMO_MODE as a boolean', () => {
    expect(typeof IS_DEMO_MODE).toBe('boolean');
  });
});
