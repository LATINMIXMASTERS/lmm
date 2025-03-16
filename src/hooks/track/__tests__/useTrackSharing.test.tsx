
import { renderHook, act } from '@testing-library/react';
import { useTrackSharing } from '../useTrackSharing';
import { useTrack } from '@/hooks/useTrackContext';

// Mock the dependencies
jest.mock('@/hooks/useTrackContext', () => ({
  useTrack: jest.fn(),
}));

describe('useTrackSharing Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handleShareTrack calls shareTrack and stops event propagation', () => {
    const shareTrackMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      shareTrack: shareTrackMock
    });
    
    const { result } = renderHook(() => useTrackSharing());
    
    const mockEvent = {
      stopPropagation: jest.fn()
    } as unknown as React.MouseEvent;
    
    // Call the handleShareTrack function
    act(() => {
      result.current.handleShareTrack('track123', mockEvent);
    });
    
    // Verify that stopPropagation was called
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    
    // Verify that shareTrack was called with the correct ID
    expect(shareTrackMock).toHaveBeenCalledWith('track123');
  });
});
