import { render, screen } from '@testing-library/react';
import Home from '../../src/pages/Home';

test('renders home welcome message', () => {
  render(<Home />);
  expect(screen.getByText(/welcome to the polkadot web portal/i)).toBeInTheDocument();
});
