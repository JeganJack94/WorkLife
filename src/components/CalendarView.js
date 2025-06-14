import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { Briefcase, Thermometer, Home, X, ChevronLeft, ChevronRight, TentTree, MoreHorizontal, Settings } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { saveData, loadData } from '../utils/storage';

const usePersistedState = (key, initialValue) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    loadData(key).then(savedItem => {
      if (savedItem !== null && savedItem !== undefined) {
        setState(savedItem);
      }
    });
    // eslint-disable-next-line
  }, [key]);

  useEffect(() => {
    saveData(key, state);
  }, [key, state]);

  return [state, setState];
};

const CalendarView = () => {
  const [selectedDates, setSelectedDates] = usePersistedState("worklife-calendar", {});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [plannedBalance, setPlannedBalance] = usePersistedState("planned-balance", 20);
  const [sickBalance, setSickBalance] = usePersistedState("sick-balance", 10);
  const [showSelector, setShowSelector] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const calculateWFOData = (days) => {
    const totalMonthDays = days.length;
    const weekends = days.filter(day => [0, 6].includes(getDay(day))).length;
    
    const currentMonthStr = format(currentMonth, 'yyyy-MM');
    const monthSelectedDates = Object.keys(selectedDates)
      .filter(date => date.startsWith(currentMonthStr));

    const holidays = monthSelectedDates
      .filter(date => selectedDates[date] === 'holiday')
      .length;
    
    const plannedLeaves = monthSelectedDates
      .filter(date => selectedDates[date] === 'planned')
      .length;
    
    const sickLeaves = monthSelectedDates
      .filter(date => selectedDates[date] === 'sick')
      .length;
    
    const workFromOfficeDays = monthSelectedDates
      .filter(date => selectedDates[date] === 'office')
      .length;
    
    const actualWorkingDays = totalMonthDays - weekends - holidays - plannedLeaves - sickLeaves;
    const targetWFODays = Math.round(actualWorkingDays * 0.4);
    const wfoPercentage = (workFromOfficeDays / actualWorkingDays) * 100 || 0;
    
    return {
      wfoPercentage: Math.round(wfoPercentage),
      workFromOfficeDays,
      actualWorkingDays,
      targetWFODays
    };
  };

  const getWFOStats = () => {
    const startDate = startOfMonth(currentMonth);
    const endDate = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    const { workFromOfficeDays, targetWFODays } = calculateWFOData(days);

    return [
      {
        name: "Work From Office",
        value: workFromOfficeDays,
        color: "#10B981", // Green color
      },
      {
        name: "Remaining WFO Days",
        value: Math.max(0, targetWFODays - workFromOfficeDays),
        color: "#6EE7B7", // Light green
      }
    ];
  };

  const getLeaveStats = () => {
    const usedLeaves = Object.values(selectedDates).reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return [
      {
        name: "Planned Leave",
        value: Math.max(0, plannedBalance - (usedLeaves.planned || 0)),
        color: "#3B82F6",
      },
      {
        name: "Used Planned Leave",
        value: usedLeaves.planned || 0,
        color: "#93C5FD",
      },
      {
        name: "Sick Leave",
        value: Math.max(0, sickBalance - (usedLeaves.sick || 0)),
        color: "#EF4444",
      },
      {
        name: "Used Sick Leave",
        value: usedLeaves.sick || 0,
        color: "#FCA5A5",
      }
    ];
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(direction === "next" ? addMonths(currentMonth, 1) : subMonths(currentMonth, 1));
  };

  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const startingDayIndex = getDay(startDate);

  const toggleDate = (dateStr, type = null) => {
    setSelectedDates((prev) => {
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
          { type: 'office', label: 'Work From Office', icon: Briefcase, color: 'green' },
          { type: 'holiday', label: 'Holiday', icon: TentTree, color: 'pink' }
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
    const baseStyle =
      "h-full w-full rounded-lg flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative text-xs";
    switch (type) {
      case "planned":
        return `${baseStyle} bg-blue-200 text-blue-800 hover:bg-blue-200`;
      case "sick":
        return `${baseStyle} bg-red-200 text-red-800 hover:bg-red-200`;
      case "office":
        return `${baseStyle} bg-green-200 text-green-800 hover:bg-green-200`;
      case "holiday":
        return `${baseStyle} bg-pink-200 text-pink-800 hover:bg-pink-200`;
      default:
        return `${baseStyle} bg-white hover:bg-gray-50`;
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        breakpoints={{
          768: {
            slidesPerView: 1.2,
          },
          1024: {
            slidesPerView: 2,
          }
        }}
      >
        {/* Leaves Balance Chart */}
        <SwiperSlide>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative h-full">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Leave Balance Overview</h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2" style={{ minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
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
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
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
        </SwiperSlide>

        {/* Work From Office Chart */}
        <SwiperSlide>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative h-full">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Work From Office Overview</h3>
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-full sm:w-1/2" style={{ minHeight: "300px" }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <PieChart>
                    <Pie
                      data={getWFOStats()}
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getWFOStats().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        value={`${calculateWFOData(eachDayOfInterval({ 
                          start: startOfMonth(currentMonth), 
                          end: endOfMonth(currentMonth) 
                        })).wfoPercentage}%`}
                        position="center"
                        className="text-2xl font-bold text-gray-800"
                      />
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} days`, name]}
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full sm:w-1/2 mt-4 sm:mt-0 sm:pl-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {getWFOStats().map((entry, index) => (
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
        </SwiperSlide>
      </Swiper>

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
            <LegendItem color="green" label="WFO" icon={<Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />} />
            <LegendItem color="pink" label="Holiday" icon={<TentTree className="w-3 h-3 sm:w-4 sm:h-4" />} />
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
                      {selectedDates[dateStr] === 'holiday' && <TentTree className="w-2 h-2 sm:w-3 sm:h-3" />}
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
       

      {/* Modal for Leave Settings */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Set Leave Balances</h3>
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-600">Planned Leaves:</label>
                <input
                  type="number"
                  value={plannedBalance}
                  onChange={(e) => setPlannedBalance(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
                  min="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-600">Sick Leaves:</label>
                <input
                  type="number"
                  value={sickBalance}
                  onChange={(e) => setSickBalance(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-300 outline-none"
                  min="0"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)} // Close modal
                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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
