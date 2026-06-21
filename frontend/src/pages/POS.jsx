import React, { useState } from 'react';
import POSCashier from './POSCashier';
import POSReport from './POSReport';

const POS = () => {
  const [activePage, setActivePage] = useState('cashier');

  return activePage === 'cashier'
    ? <POSCashier onNavigateReport={() => setActivePage('report')} />
    : <POSReport onNavigateCashier={() => setActivePage('cashier')} />;
};

export default POS;
