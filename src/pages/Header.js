import React from 'react';
import { Calendar, FileText } from 'lucide-react';

const Header = ({ activePage, setActivePage }) => {
  return (
    <div className="bg-gradient-to-r from-[#CE93D8] to-[#8E24AA] shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">WorkLife</h1>
          </div>
          
          <nav className="flex items-center space-x-1">
            <NavButton 
              icon={<Calendar className="w-4 h-4" />} 
              label="Home"
              active={activePage === 'home'}
              onClick={() => setActivePage('home')}
            />
            <NavButton 
              icon={<FileText className="w-4 h-4" />} 
              label="Notes"
              active={activePage === 'notes'}
              onClick={() => setActivePage('notes')}
            />
          </nav>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1 px-2 py-2 rounded-lg transition-colors
      ${active ? 'bg-white text-[#8E24AA]' : 'text-white hover:bg-white/20'}
      sm:px-3`}
  >
    {icon}
    <span className="hidden sm:inline text-sm">{label}</span>
  </button>
);

export default Header;