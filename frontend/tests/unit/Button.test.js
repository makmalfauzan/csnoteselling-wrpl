// Import testing utilities
import { fireEvent, screen } from '@testing-library/dom';

// Import komponen yang akan ditest (sesuaikan dengan struktur file Anda)
// Misalnya jika Anda punya file src/components/Button.js
// import { createButton } from '../../src/components/Button.js';

describe('Button Component', () => {
  beforeEach(() => {
    // Setup DOM untuk setiap test
    document.body.innerHTML = '';
  });

  test('should create button element', () => {
    // Create button element
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.className = 'btn btn-primary';

    // Add to DOM
    document.body.appendChild(button);

    // Test assertions
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  test('should handle click events', () => {
    // Create button with click handler
    const mockHandler = jest.fn();
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.addEventListener('click', mockHandler);

    // Add to DOM
    document.body.appendChild(button);

    // Trigger click event
    fireEvent.click(button);

    // Test assertions
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when disabled attribute is set', () => {
    // Create disabled button
    const button = document.createElement('button');
    button.textContent = 'Disabled Button';
    button.disabled = true;

    // Add to DOM
    document.body.appendChild(button);

    // Test assertions
    expect(button).toBeDisabled();
  });

  test('should have proper styling classes', () => {
    // Test dengan berbagai style classes
    const primaryButton = document.createElement('button');
    primaryButton.className =
      'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';

    document.body.appendChild(primaryButton);

    expect(primaryButton).toHaveClass('bg-blue-500');
    expect(primaryButton).toHaveClass('text-white');
    expect(primaryButton).toHaveClass('font-bold');
  });
});
