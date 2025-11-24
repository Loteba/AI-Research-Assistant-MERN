// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock simple de `navigator.clipboard` usado en algunos componentes
if (!global.navigator.clipboard) {
  global.navigator.clipboard = {
    writeText: async () => {},
  };
}
