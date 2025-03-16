
import { renderHook, act } from '@testing-library/react';
import { useTrackComments } from '../useTrackComments';
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

describe('useTrackComments Hook', () => {
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
      addComment: jest.fn()
    });
  });

  test('handleCommentChange updates comment text for a specific track', () => {
    const { result } = renderHook(() => useTrackComments());
    
    // Initially, there should be no comments
    expect(result.current.newComments).toEqual({});
    
    // Call handleCommentChange
    act(() => {
      result.current.handleCommentChange('track123', 'Great track!');
    });
    
    // Verify the comment was stored correctly
    expect(result.current.newComments).toEqual({
      track123: 'Great track!'
    });
    
    // Add another comment for a different track
    act(() => {
      result.current.handleCommentChange('track456', 'Nice beat!');
    });
    
    // Verify both comments are stored correctly
    expect(result.current.newComments).toEqual({
      track123: 'Great track!',
      track456: 'Nice beat!'
    });
    
    // Update existing comment
    act(() => {
      result.current.handleCommentChange('track123', 'Amazing track!');
    });
    
    // Verify comment was updated
    expect(result.current.newComments).toEqual({
      track123: 'Amazing track!',
      track456: 'Nice beat!'
    });
  });

  test('handleSubmitComment submits comment when user is authenticated', () => {
    // Setup authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', username: 'testuser' }
    });
    
    const addCommentMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      addComment: addCommentMock
    });
    
    const { result } = renderHook(() => useTrackComments());
    
    // Set a comment value
    act(() => {
      result.current.handleCommentChange('track123', 'Great track!');
    });
    
    const mockEvent = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;
    
    // Submit the comment
    act(() => {
      result.current.handleSubmitComment('track123', mockEvent);
    });
    
    // Verify preventDefault was called
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    // Verify addComment was called with correct arguments
    expect(addCommentMock).toHaveBeenCalledWith('track123', {
      userId: 'user1',
      username: 'testuser',
      text: 'Great track!'
    });
    
    // Verify comment was cleared after submission
    expect(result.current.newComments).toEqual({
      track123: ''
    });
  });

  test('handleSubmitComment shows toast and redirects when user is not authenticated', () => {
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
    
    const addCommentMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      addComment: addCommentMock
    });
    
    const { result } = renderHook(() => useTrackComments());
    
    // Set a comment value
    act(() => {
      result.current.handleCommentChange('track123', 'Great track!');
    });
    
    const mockEvent = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;
    
    // Try to submit the comment
    act(() => {
      result.current.handleSubmitComment('track123', mockEvent);
    });
    
    // Verify toast was shown with correct message
    expect(toastMock).toHaveBeenCalledWith({
      title: "Authentication Required",
      description: "Please login to comment",
      variant: "destructive"
    });
    
    // Verify that navigate was called to redirect to login
    expect(navigateMock).toHaveBeenCalledWith('/login');
    
    // Verify that addComment was NOT called
    expect(addCommentMock).not.toHaveBeenCalled();
  });

  test('handleSubmitComment does not submit empty comments', () => {
    // Setup authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', username: 'testuser' }
    });
    
    const addCommentMock = jest.fn();
    (useTrack as jest.Mock).mockReturnValue({
      addComment: addCommentMock
    });
    
    const { result } = renderHook(() => useTrackComments());
    
    // Set an empty comment
    act(() => {
      result.current.handleCommentChange('track123', '   ');
    });
    
    const mockEvent = {
      preventDefault: jest.fn()
    } as unknown as React.FormEvent;
    
    // Try to submit the empty comment
    act(() => {
      result.current.handleSubmitComment('track123', mockEvent);
    });
    
    // Verify preventDefault was called
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    
    // Verify addComment was NOT called for empty comment
    expect(addCommentMock).not.toHaveBeenCalled();
  });
});
