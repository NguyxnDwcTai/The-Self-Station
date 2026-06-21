import React from 'react';
import '../../pages/AdminTheme.css';
import POSSidebar from './POSSidebar';
import POSHeader from './POSHeader';

const POSLayout = ({ children, title }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--dashboard-bg)] font-['Inter'] text-[var(--dashboard-text-main)]">
      <POSSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <POSHeader title={title} />
        <main className="flex-1 overflow-hidden flex flex-col p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default POSLayout;
