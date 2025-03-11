
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Comment } from '@/models/Track';

interface CommentSectionProps {
  comments: Comment[];
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  newComment,
  onCommentChange,
  onSubmitComment
}) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <form onSubmit={onSubmitComment} className="flex gap-2 mb-3">
        <input 
          type="text"
          placeholder="Add a comment..."
          className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-md"
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
        <Button type="submit" size="sm" variant="secondary">Post</Button>
      </form>
      
      <div className="space-y-3 max-h-40 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs">
              {comment.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{comment.username}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(comment.date), 'MMM d, h:mma')}
                </span>
              </div>
              <p className="text-sm">{comment.text}</p>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
