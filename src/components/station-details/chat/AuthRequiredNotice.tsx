
import React from 'react';

const AuthRequiredNotice: React.FC = () => {
  return (
    <div className="border border-muted rounded p-3 text-center text-sm">
      <p>Please sign in to participate in the chat</p>
    </div>
  );
};

export default AuthRequiredNotice;
