import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './NavBar';

jest.mock('react-router-dom');

describe('Navbar', () => {
  it('renders primary navigation links', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();
  });
});

