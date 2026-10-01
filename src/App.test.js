import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SkyBank application correctly', () => {
  render(<App />);
  const bankElements = screen.getAllByText(/SKY/i);
  expect(bankElements.length).toBeGreaterThan(0);
});
