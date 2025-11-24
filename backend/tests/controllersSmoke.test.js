// Simple smoke test: require each controller to exercise module code (minimal and safe)
jest.mock('../models/userModel');
jest.mock('../models/projectModel');
jest.mock('../models/taskModel');
jest.mock('../models/notificationModel');
jest.mock('../models/libraryItemModel');
jest.mock('../services/dropboxClient');

const controllers = [
  'adminUserController',
  'aiController',
  'avatarController',
  'libraryController',
  'metricsController',
  'notificationController',
  'passwordController',
  'privacyController',
  'projectController',
  'settingsController',
  'superAdminController',
  'taskController',
  'userController',
];

describe('Controllers smoke require', () => {
  controllers.forEach((name) => {
    it(`requires ${name} without throwing`, () => {
      let mod;
      try {
        // require the module; if it throws the test fails
        mod = require(`../controllers/${name}`);
      } catch (e) {
        // rethrow to make the test fail with the original error
        throw e;
      }
      expect(mod).toBeDefined();
    });
  });
});
