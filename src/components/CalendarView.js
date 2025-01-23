import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { Briefcase, Thermometer, Home, X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const usePersistedState = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const savedItem = localStorage.getItem(key);
      return savedItem ? JSON.parse(savedItem) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, state]);

  return [state, setState];
};

const CalendarView = () => {
  const [selectedDates, setSelectedDates] = usePersistedState('worklife-calendar', {});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSelector, setShowSelector] = useState(null);
  const [leaveSettings, setLeaveSettings] = usePersistedState('worklife-user-settings', {
    plannedLeaveBalance: 10,
    sickLeaveBalance: 5
  });

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'worklife-user-settings') {
        try {
          const parsedSettings = JSON.parse(event.newValue);
          setLeaveSettings({
            plannedLeaveBalance: parsedSettings.plannedLeaveBalance || 10,
            sickLeaveBalance: parsedSettings.sickLeaveBalance || 5
          });
        } catch (error) {
          console.error('Error parsing settings:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setLeaveSettings]);

  const getLeaveStats = () => {
    const usedLeaves = Object.values(selectedDates).reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        name: 'Planned Leave',
        value: Math.max(0, leaveSettings.plannedLeaveBalance - (usedLeaves.planned || 0)),
        color: '#3B82F6'
      },
      {
        name: 'Used Planned Leave',
        value: usedLeaves.planned || 0,
        color: '#93C5FD'
      },
      {
        name: 'Sick Leave',
        value: Math.max(0, leaveSettings.sickLeaveBalance - (usedLeaves.sick || 0)),
        color: '#EF4444'
      },
      {
        name: 'Used Sick Leave',
        value: usedLeaves.sick || 0,
        color: '#FCA5A5'
      }
    ];
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(direction === 'next' ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };

  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const startingDayIndex = getDay(startDate);

  const toggleDate = (dateStr, type = null) => {
    setSelectedDates(prev => {
      const updatedDates = { ...prev };
      if (type === null || updatedDates[dateStr] === type) {
        delete updatedDates[dateStr];
      } else {
        updatedDates[dateStr] = type;
      }
      return updatedDates;
    });
    setShowSelector(null);
  };

  const DateSelector = ({ dateStr, onSelect, onClose }) => (
    <div className="absolute z-20 bg-white rounded-xl shadow-2xl border border-gray-200 
      w-56 p-3 transform -translate-x-1/2 left-1/2 
      transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-3 pb-2 border-b">
        <span className="font-semibold text-gray-700 text-sm">{format(new Date(dateStr), 'dd MMM yyyy')}</span>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {[
          { type: 'planned', label: 'Planned Leave', icon: Home, color: 'blue' },
          { type: 'sick', label: 'Sick Leave', icon: Thermometer, color: 'red' },
          { type: 'office', label: 'Work From Home', icon: Briefcase, color: 'green' }
        ].map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => onSelect(dateStr, type)}
            className={`
              w-full flex items-center justify-between p-2 rounded-lg 
              hover:bg-${color}-50 text-left text-sm
              ${selectedDates[dateStr] === type ? `bg-${color}-100` : ''}
            `}
          >
            <div className="flex items-center space-x-2">
              <Icon className={`w-4 h-4 text-${color}-600`} />
              <span>{label}</span>
            </div>
            {selectedDates[dateStr] === type && <span className="text-xs text-gray-500">Selected</span>}
          </button>
        ))}
        <button
          onClick={() => onSelect(dateStr, null)}
          className="
            w-full flex items-center justify-between p-2 rounded-lg 
            hover:bg-gray-50 text-left text-sm
            text-gray-600 hover:text-gray-800
          "
        >
          <div className="flex items-center space-x-2">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
            <span>Clear Selection</span>
          </div>
        </button>
      </div>
    </div>
  );

  const getDateStyle = (type) => {
    const baseStyle = "h-full w-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative text-xs";
    switch(type) {
      case 'planned':
        return `${baseStyle} bg-blue-100 text-blue-800 hover:bg-blue-200`;
      case 'sick':
        return `${baseStyle} bg-red-100 text-red-800 hover:bg-red-200`;
      case 'office':
        return `${baseStyle} bg-green-100 text-green-800 hover:bg-green-200`;
      default:
        return `${baseStyle} bg-white hover:bg-gray-50`;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Leave Balance Overview</h3>
        <div className="flex flex-col sm:flex-row items-center">
          <div className="w-full sm:w-1/2" style={{ height: '300px' }}> {/* Fixed height */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getLeaveStats()}
                  innerRadius="60%"
                  outerRadius="80%"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getLeaveStats().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} days`, name]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-1/2 mt-4 sm:mt-0 sm:pl-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {getLeaveStats().map((entry, index) => (
                <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <div>
                    <span className="text-xs sm:text-sm text-gray-600 block">{entry.name}</span>
                    <span className="text-sm sm:text-base font-semibold">{entry.value} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex space-x-2 sm:space-x-4">
            <LegendItem color="blue" label="PL" icon={<Home className="w-3 h-3 sm:w-4 sm:h-4" />} />
            <LegendItem color="red" label="SL" icon={<Thermometer className="w-3 h-3 sm:w-4 sm:h-4" />} />
            <LegendItem color="green" label="WFH" icon={<Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />} />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium text-gray-500 text-xs sm:text-sm pb-1 sm:pb-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: startingDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
            const dateStyle = getDateStyle(selectedDates[dateStr]);
            
            return (
              <div key={dateStr} className="aspect-square p-0.5 sm:p-1 relative">
                <div
                  className={`${dateStyle} ${
                    isToday ? 'ring-2 ring-purple-400 ring-offset-2' : ''
                  }`}
                  onClick={() => setShowSelector(dateStr === showSelector ? null : dateStr)}
                >
                  <span className={`text-xs sm:text-sm font-medium ${
                    isToday ? 'text-purple-600' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {selectedDates[dateStr] && (
                    <span className="text-[0.5rem] sm:text-xs mt-0.5">
                      {selectedDates[dateStr] === 'planned' && <Home className="w-2 h-2 sm:w-3 sm:h-3" />}
                      {selectedDates[dateStr] === 'sick' && <Thermometer className="w-2 h-2 sm:w-3 sm:h-3" />}
                      {selectedDates[dateStr] === 'office' && <Briefcase className="w-2 h-2 sm:w-3 sm:h-3" />}
                    </span>
                  )}
                </div>
                {showSelector === dateStr && (
                  <DateSelector 
                    dateStr={dateStr}
                    onSelect={toggleDate}
                    onClose={() => setShowSelector(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label, icon }) => (
  <div className="flex items-center space-x-1 sm:space-x-2">
    <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-${color}-100 border border-${color}-200`}>
      {icon}
    </div>
    <span className="text-xs sm:text-sm font-medium text-gray-600">{label}</span>
  </div>
);

export default CalendarView;