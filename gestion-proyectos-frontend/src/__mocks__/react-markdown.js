// src/__mocks__/react-markdown.js
import React from 'react';
export default function ReactMarkdown({ children }) {
  return <div data-testid="react-markdown">{children}</div>;
}
