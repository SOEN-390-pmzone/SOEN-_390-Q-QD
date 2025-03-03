import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import FloatingSearchBar from '../../components/FloatingSearchBar';

// Mock the fetch function
global.fetch = jest.fn();

// Mock the external dependencies
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

// Correctly mock the styles import based on the actual path
jest.mock('../../styles', () => ({
  searchBar: {},
  icon: {},
  input: {},
  list: {},
  item: {}
}));



// Mock environment variables properly
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: 'test-api-key'
    }
  }
}));

describe('FloatingSearchBar Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();
  });

  const mockOnPlaceSelect = jest.fn();
  const defaultProps = {
    onPlaceSelect: mockOnPlaceSelect,
    placeholder: 'Test placeholder'
  };

  it('renders correctly with default props', () => {
    const { getByPlaceholderText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    expect(getByPlaceholderText('Test placeholder')).toBeTruthy();
  });

  it('updates search query when text input changes', () => {
    const { getByPlaceholderText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    fireEvent.changeText(input, 'Montreal');
    
    expect(input.props.value).toBe('Montreal');
  });

  it('does not fetch predictions when search query is less than 3 characters', async () => {
    const { getByPlaceholderText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mo');
    });
    
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetches predictions when search query is 3 or more characters', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        predictions: [
          { place_id: '1', description: 'Montreal, QC, Canada' },
          { place_id: '2', description: 'Moncton, NB, Canada' }
        ]
      })
    });

    const { getByPlaceholderText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mon');
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(fetch).toHaveBeenCalledTimes(1);
    // Using a more flexible expectation that doesn't rely on exact URL match
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Mon')
    );
  });

  it('displays predictions after successful API response', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        predictions: [
          { place_id: '1', description: 'Montreal, QC, Canada' },
          { place_id: '2', description: 'Moncton, NB, Canada' }
        ]
      })
    });

    const { getByPlaceholderText, findByText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mon');
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const prediction = await findByText('Montreal, QC, Canada');
    expect(prediction).toBeTruthy();
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    fetch.mockRejectedValueOnce(new Error('Network error'));
    console.error = jest.fn(); // Mock console.error to prevent test output noise

    const { getByPlaceholderText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mon');
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(console.error).toHaveBeenCalled();
  });

  it('clears search when clear button is pressed', async () => {
    // Mock successful API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        predictions: [
          { place_id: '1', description: 'Montreal, QC, Canada' }
        ]
      })
    });

    const { getByPlaceholderText, findByText, UNSAFE_getAllByType } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mon');
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Wait for prediction to appear
    await findByText('Montreal, QC, Canada');
    
    // Find close button - Better approach than mocking createElement
    const closeButtons = UNSAFE_getAllByType('Ionicons').filter(
      node => node.props.name === 'close-circle'
    );
    const clearButton = closeButtons[0];
    
    await act(async () => {
      fireEvent.press(clearButton);
    });
    
    expect(input.props.value).toBe('');
  });

  it('fetches place details and calls onPlaceSelect when a prediction is selected', async () => {
    // Mock successful autocomplete API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        predictions: [
          { place_id: '1', description: 'Montreal, QC, Canada' }
        ]
      })
    });
    
    // Mock successful place details API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        result: {
          geometry: {
            location: {
              lat: 45.5017,
              lng: -73.5673
            }
          }
        }
      })
    });

    const { getByPlaceholderText, findByText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mon');
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const prediction = await findByText('Montreal, QC, Canada');
    
    await act(async () => {
      fireEvent.press(prediction);
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      2, 
      expect.stringContaining('https://maps.googleapis.com/maps/api/place/details/json?place_id=1')
    );
    
    expect(mockOnPlaceSelect).toHaveBeenCalledWith({
      latitude: 45.5017,
      longitude: -73.5673
    });
  });

  it('handles place details API error gracefully', async () => {
    // Mock successful autocomplete API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        predictions: [
          { place_id: '1', description: 'Montreal, QC, Canada' }
        ]
      })
    });
    
    // Mock place details API error
    fetch.mockRejectedValueOnce(new Error('Network error'));
    console.error = jest.fn(); // Mock console.error to prevent test output noise

    const { getByPlaceholderText, findByText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mon');
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const prediction = await findByText('Montreal, QC, Canada');
    
    await act(async () => {
      fireEvent.press(prediction);
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(console.error).toHaveBeenCalled();
  });

  it('sets selected location after successful place selection', async () => {
    // Mock successful autocomplete API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        predictions: [
          { place_id: '1', description: 'Montreal, QC, Canada' }
        ]
      })
    });
    
    // Mock successful place details API response
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        result: {
          geometry: {
            location: {
              lat: 45.5017,
              lng: -73.5673
            }
          }
        }
      })
    });

    const { getByPlaceholderText, findByText } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    await act(async () => {
      fireEvent.changeText(input, 'Mon');
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const prediction = await findByText('Montreal, QC, Canada');
    
    await act(async () => {
      fireEvent.press(prediction);
      // Allow the async operation to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Check placeholder after selection  
    expect(input.props.placeholder).toBe('Montreal, QC, Canada');
  });

  it('displays loading indicator while fetching predictions', async () => {
    // Create a Promise that we can resolve manually to control the timing
    let resolvePromise;
    const fetchPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    fetch.mockReturnValueOnce(fetchPromise);
    
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(
      <FloatingSearchBar {...defaultProps} />
    );
    
    const input = getByPlaceholderText('Test placeholder');
    
    act(() => {
      fireEvent.changeText(input, 'Mon');
    });
    
    // Manually wait a bit to ensure loading state is set
    await waitFor(() => {
      // Check if ActivityIndicator exists
      const indicators = UNSAFE_getAllByType('ActivityIndicator');
      expect(indicators.length).toBeGreaterThan(0);
    });
    
    // Resolve the promise to complete the test
    resolvePromise({
      json: () => Promise.resolve({
        predictions: [
          { place_id: '1', description: 'Montreal, QC, Canada' }
        ]
      })
    });
  });
});