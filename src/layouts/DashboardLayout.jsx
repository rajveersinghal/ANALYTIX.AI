import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

export default function DashboardLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#000000] text-white overflow-x-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarVisible && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}

      {/* Sidebar - Fixed & Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarVisible ? 'translate-x-0' : '-translate-x-full'}
        w-64 shrink-0
      `}>
        <Sidebar onClose={() => setIsSidebarVisible(false)} />
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300
        ${isSidebarVisible ? 'lg:pl-64' : 'pl-0'}
      `}>
        <Topbar 
          onMenuClick={() => setIsSidebarVisible(!isSidebarVisible)} 
          isSidebarOpen={isSidebarVisible} 
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
