const React = require('react');

module.exports = {
  Routes: ({ children }) => React.createElement(React.Fragment, null, children),
  Route: ({ children }) => React.createElement(React.Fragment, null, children),
  Navigate: () => null,
  Link: ({ children }) => React.createElement('a', null, children),
  NavLink: ({ children }) => React.createElement('a', null, children),
  useNavigate: () => () => {},
  useParams: () => ({}),
  MemoryRouter: ({ children }) => children,
  BrowserRouter: ({ children }) => children,
  Outlet: () => null,
};
