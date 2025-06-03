import React from 'react';

const FooterNote: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <p className="text-center text-sm text-muted-foreground py-4">
      © {currentYear} Guest List Planner. All rights reserved.
    </p>
  );
};

export default FooterNote;
