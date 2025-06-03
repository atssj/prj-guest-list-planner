import React from 'react';

const FooterNote: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <p className="text-center text-sm text-gray-500">
      © {currentYear} Guest List Planner. All rights reserved.
    </p>
  );
};

export default FooterNote;