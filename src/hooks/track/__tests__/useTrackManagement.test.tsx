
import { renderHook, act } from '@testing-library/react';
import { useTrackManagement } from '../useTrackManagement';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useTrackContext', () => ({
  useTrack: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('useTrackManagement Hook', () => {
  // Setup common mocks before each test
  beforeEach(() => {
    // Mock navigate function
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
    
    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user1', isAdmin: false }
    });
    
    // Mock track context
    (useTrack as jest.Mock).mockReturnValue({
      deleteTrack: jest.fn(),
      canEditTrack: jest.fn().mockReturnValue(true)
    });
    
    // Mock toast
    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn()
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('handleEditTrack navigates to edit track page', () => {
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
    
    const { result } = renderHook(() => useTrackManagement());
    
    const mockEvent = {
      stopPropagation: jest.fn()
    } as unknown as React.MouseEvent;
    
    // Call the handleEditTrack function
    act(() => {
      result.current.handleEditTrack('track123', mockEvent);
    });
    
    // Verify that stopPropagation was called
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    
    // Verify that navigate was called with the correct path
    expect(navigateMock).toHaveBeenCalledWith('/edit-track/track123');
  });

  test('handleDeleteTrack calls deleteTrack with track ID', () => {
    const deleteTrackMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      deleteTrack: deleteTrackMock,
      canEditTrack: jest.fn().mockReturnValue(true)
    });
    
    const { result } = renderHook(() => useTrackManagement());
    
    // Call the handleDeleteTrack function
    act(() => {
      result.current.handleDeleteTrack('track456');
    });
    
    // Verify that deleteTrack was called with the correct ID
    expect(deleteTrackMock).toHaveBeenCalledWith('track456');
  });

  test('canUserEditTrack returns true for tracks the user can edit', () => {
    const canEditTrackMock = jest.fn().mockReturnValue(true);
    (useTrack as jest.Mock).mockReturnValue({
      deleteTrack: jest.fn(),
      canEditTrack: canEditTrackMock
    });
    
    const { result } = renderHook(() => useTrackManagement());
    
    // Check if user can edit the track
    const canEdit = result.current.canUserEditTrack('track789');
    
    // Verify canEditTrack was called with the correct ID
    expect(canEditTrackMock).toHaveBeenCalledWith('track789');
    
    // Verify the result is true
    expect(canEdit).toBe(true);
  });

  test('canUserEditTrack returns false for tracks the user cannot edit', () => {
    const canEditTrackMock = jest.fn().mockReturnValue(false);
    (useTrack as jest.Mock).mockReturnValue({
      deleteTrack: jest.fn(),
      canEditTrack: canEditTrackMock
    });
    
    const { result } = renderHook(() => useTrackManagement());
    
    // Check if user can edit the track
    const canEdit = result.current.canUserEditTrack('track789');
    
    // Verify the result is false
    expect(canEdit).toBe(false);
  });
});
