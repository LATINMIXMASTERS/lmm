
import { renderHook, act } from '@testing-library/react';
import { useTrackLikes } from '../useTrackLikes';
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

describe('useTrackLikes Hook', () => {
  // Setup common mocks before each test
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock navigate function
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
    
    // Mock toast
    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn()
    });
    
    // Mock track context
    (useTrack as jest.Mock).mockReturnValue({
      likeTrack: jest.fn()
    });
  });

  test('handleLikeTrack calls likeTrack when user is authenticated', () => {
    // Setup authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1' }
    });
    
    const likeTrackMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      likeTrack: likeTrackMock
    });
    
    const { result } = renderHook(() => useTrackLikes());
    
    const mockEvent = {
      stopPropagation: jest.fn()
    } as unknown as React.MouseEvent;
    
    // Call the handleLikeTrack function
    act(() => {
      result.current.handleLikeTrack('track123', mockEvent);
    });
    
    // Verify that stopPropagation was called
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    
    // Verify that likeTrack was called with the correct ID
    expect(likeTrackMock).toHaveBeenCalledWith('track123');
  });

  test('handleLikeTrack shows toast and redirects when user is not authenticated', () => {
    // Setup unauthenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false
    });
    
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
    
    const toastMock = jest.fn();
    (useToast as jest.Mock).mockReturnValue({
      toast: toastMock
    });
    
    const likeTrackMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      likeTrack: likeTrackMock
    });
    
    const { result } = renderHook(() => useTrackLikes());
    
    const mockEvent = {
      stopPropagation: jest.fn()
    } as unknown as React.MouseEvent;
    
    // Call the handleLikeTrack function
    act(() => {
      result.current.handleLikeTrack('track123', mockEvent);
    });
    
    // Verify toast was shown with correct message
    expect(toastMock).toHaveBeenCalledWith({
      title: "Authentication Required",
      description: "Please login to like tracks",
      variant: "destructive"
    });
    
    // Verify that navigate was called to redirect to login
    expect(navigateMock).toHaveBeenCalledWith('/login');
    
    // Verify that likeTrack was NOT called
    expect(likeTrackMock).not.toHaveBeenCalled();
  });
});
