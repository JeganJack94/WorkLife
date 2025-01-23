import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Briefcase, Thermometer, Home, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CalendarView = () => {
  const [selectedDates, setSelectedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSelector, setShowSelector] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({ planned: 10, sick: 5 });

  useEffect(() => {
    const savedDates = localStorage.getItem('worklife-calendar');
    const savedProfile = localStorage.getItem('worklife-profile');
    if (savedDates) {
      setSelectedDates(JSON.parse(savedDates));
    }
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setLeaveBalance({
        planned: profile.plannedBalance || 10,
        sick: profile.sickBalance || 5
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('worklife-calendar', JSON.stringify(selectedDates));
  }, [selectedDates]);

  const getLeaveStats = () => {
    const usedLeaves = Object.values(selectedDates).reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        name: 'Planned Leave',
        value: leaveBalance.planned - (usedLeaves.planned || 0),
        color: '#3B82F6'
      },
      {
        name: 'Used Planned Leave',
        value: usedLeaves.planned || 0,
        color: '#93C5FD'
      },
      {
        name: 'Sick Leave',
        value: leaveBalance.sick - (usedLeaves.sick || 0),
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

  const toggleDate = (dateStr, type) => {
    setSelectedDates(prev => ({
      ...prev,
      [dateStr]: type
    }));
    setShowSelector(null);
  };

  const DateSelector = ({ dateStr, onSelect, onClose }) => (
    <div className="absolute z-10 bg-white rounded-lg shadow-xl p-2 border border-gray-200 w-48 max-w-full">
      <div className="flex justify-between items-center mb-2 pb-2 border-b">
        <span className="font-medium text-gray-700 text-sm">Select Type</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        <button
          onClick={() => onSelect(dateStr, 'planned')}
          className="w-full flex items-center space-x-2 p-1 rounded-lg hover:bg-blue-50 text-left text-xs"
        >
          <Home className="w-3 h-3 text-blue-600" />
          <span>Planned Leave (PL)</span>
        </button>
        <button
          onClick={() => onSelect(dateStr, 'sick')}
          className="w-full flex items-center space-x-2 p-1 rounded-lg hover:bg-red-50 text-left text-xs"
        >
          <Thermometer className="w-3 h-3 text-red-600" />
          <span>Sick Leave (SL)</span>
        </button>
        <button
          onClick={() => onSelect(dateStr, 'office')}
          className="w-full flex items-center space-x-2 p-1 rounded-lg hover:bg-green-50 text-left text-xs"
        >
          <Briefcase className="w-3 h-3 text-green-600" />
          <span>Work From Home (WFH)</span>
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
      {/* Leave Balance Overview */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Leave Balance Overview</h3>
        <div className="flex flex-col sm:flex-row items-center">
          <div className="w-full sm:w-1/2 h-48 sm:h-64">
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
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
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