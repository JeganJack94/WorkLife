import React, { useState, useEffect } from 'react';
import Header from './pages/Header';
import CalendarView from './components/CalendarView';
import NotesPage from './pages/NotesPage';

const App = () => {
  const [activePage, setActivePage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3E5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#CE93D8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading WorkLife...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3E5F5]">
      <Header activePage={activePage} setActivePage={setActivePage} />
      
      <main className="container mx-auto py-6 px-4">
        <div className={`transition-all duration-300 ${
          activePage === 'home' ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <CalendarView />
        </div>
              
        <div className={`transition-all duration-300 ${
          activePage === 'notes' ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <NotesPage />
        </div>
      </main>
    </div>
  );
};

export default App;