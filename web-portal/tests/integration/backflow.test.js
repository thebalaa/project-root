import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App';

test('navigates to AI analytics page', async () => {
  render(
    <MemoryRouter initialEntries={['/ai-analytics']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/AI Analytics/i)).toBeInTheDocument();
});
