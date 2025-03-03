import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DirectionsBox from '../../components/DirectionsBox';

describe('DirectionsBox', () => {
  const directions = [
    {
      html_instructions: 'Turn <b>left</b> at the next intersection',
      distance: '200m',
    },
    {
      html_instructions: 'Continue <b>straight</b> for 500m',
      distance: '500m',
    },
  ];

  it('renders correctly with directions', () => {
    const { getByText } = render(<DirectionsBox directions={directions} />);
    expect(getByText('Turn')).toBeTruthy();
    expect(getByText('left')).toBeTruthy();
    expect(getByText('at the next intersection')).toBeTruthy();
    expect(getByText('200m')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
    expect(getByText('straight')).toBeTruthy();
    expect(getByText('for 500m')).toBeTruthy();
    expect(getByText('500m')).toBeTruthy();
  });

  it('renders correctly with no directions', () => {
    const { getByText } = render(<DirectionsBox directions={[]} />);
    expect(getByText('No directions available')).toBeTruthy();
  });

  it('toggles collapse state on handle press', async () => {
    const { getByTestId } = render(<DirectionsBox directions={directions} />);
    const handle = getByTestId('handle');
    fireEvent.press(handle);
    await waitFor(() => {
      expect(getByTestId('directionsBox')).toHaveStyle({ transform: [{ translateY: 0 }] });
    });
    fireEvent.press(handle);
    await waitFor(() => {
      expect(getByTestId('directionsBox')).toHaveStyle({ transform: [{ translateY: 300 }] });
    });
  });

  it('opens the directions box when the handle is pressed', () => {
    const { getByTestId } = render(<DirectionsBox directions={directions} />);
    const handle = getByTestId('handle');
    fireEvent.press(handle);
    expect(getByTestId('directionsBox')).toBeTruthy();
  });

  it('closes the directions box when the handle is pressed twice', async () => {
    const { getByTestId } = render(<DirectionsBox directions={directions} />);
    const handle = getByTestId('handle');
    fireEvent.press(handle);
    await waitFor(() => {
      expect(getByTestId('directionsBox')).toHaveStyle({ transform: [{ translateY: 0 }] });
    });
    fireEvent.press(handle);
    await waitFor(() => {
      expect(getByTestId('directionsBox')).toHaveStyle({ transform: [{ translateY: 300 }] });
    });
  });

  it('initial state is collapsed', () => {
    const { getByTestId } = render(<DirectionsBox directions={directions} />);
    expect(getByTestId('directionsBox')).toHaveStyle({ transform: [{ translateY: 300 }] });
  });

  it('parses HTML instructions correctly', () => {
    const { getByText } = render(<DirectionsBox directions={[{ html_instructions: 'Turn <b>left</b> at the next intersection', distance: '200m' }]} />);
    expect(getByText('Turn')).toBeTruthy();
    expect(getByText('left')).toBeTruthy();
    expect(getByText('at the next intersection')).toBeTruthy();
  });

  it('handles empty HTML instructions', () => {
    const { getByText } = render(<DirectionsBox directions={[{ html_instructions: '', distance: '200m' }]} />);
    expect(getByText('200m')).toBeTruthy();
  });

  it('handles HTML instructions without <b> tags', () => {
    const { getByText } = render(<DirectionsBox directions={[{ html_instructions: 'Turn left at the next intersection', distance: '200m' }]} />);
    expect(getByText('Turn left at the next intersection')).toBeTruthy();
  });
});