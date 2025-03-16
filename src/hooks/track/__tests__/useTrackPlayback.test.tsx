
import { renderHook, act } from '@testing-library/react';
import { useTrackPlayback } from '../useTrackPlayback';
import { useTrack } from '@/hooks/useTrackContext';

// Mock the dependencies
jest.mock('@/hooks/useTrackContext', () => ({
  useTrack: jest.fn(),
}));

describe('useTrackPlayback Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handlePlayTrack sets current playing track when different track is selected', () => {
    const setCurrentPlayingTrackMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      currentPlayingTrack: 'track456',
      setCurrentPlayingTrack: setCurrentPlayingTrackMock
    });
    
    const { result } = renderHook(() => useTrackPlayback());
    
    // Call handlePlayTrack with a different track ID
    act(() => {
      result.current.handlePlayTrack('track123');
    });
    
    // Verify setCurrentPlayingTrack was called with the new track ID
    expect(setCurrentPlayingTrackMock).toHaveBeenCalledWith('track123');
  });

  test('handlePlayTrack sets current playing track to null when same track is selected (toggle off)', () => {
    const setCurrentPlayingTrackMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      currentPlayingTrack: 'track123',
      setCurrentPlayingTrack: setCurrentPlayingTrackMock
    });
    
    const { result } = renderHook(() => useTrackPlayback());
    
    // Call handlePlayTrack with the same track ID that's currently playing
    act(() => {
      result.current.handlePlayTrack('track123');
    });
    
    // Verify setCurrentPlayingTrack was called with null to stop playback
    expect(setCurrentPlayingTrackMock).toHaveBeenCalledWith(null);
  });
});
