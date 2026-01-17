import { useState, useEffect } from 'react';
import { Plus, Minus, Target, TrendingUp, Flame, Trophy, ChevronDown, ChevronUp, Trash2, Settings, X, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function App() {
  const [yearlyGoal, setYearlyGoal] = useState(20000);
  const [entries, setEntries] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tempGoal, setTempGoal] = useState(20000);
  const [backlogDate, setBacklogDate] = useState('');
  const [backlogCount, setBacklogCount] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState('today');

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const stored = localStorage.getItem('pushup-data');
      if (stored) {
        const data = JSON.parse(stored);
        setYearlyGoal(data.yearlyGoal || 20000);
        setTempGoal(data.yearlyGoal || 20000);
        setEntries(data.entries || []);
        const todayEntry = (data.entries || []).find(e => e.date === today);
        setTodayCount(todayEntry ? todayEntry.count : 0);
      }
    } catch (e) {
      console.log('No existing data found');
    }
    setLoading(false);
  };

  const saveData = (newEntries, newGoal) => {
    try {
      localStorage.setItem('pushup-data', JSON.stringify({
        yearlyGoal: newGoal,
        entries: newEntries
      }));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  };

  const addPushups = (amount) => {
    const newCount = Math.max(0, todayCount + amount);
    setTodayCount(newCount);
    
    const existingIndex = entries.findIndex(e => e.date === today);
    let newEntries;
    
    if (existingIndex >= 0) {
      newEntries = entries.map((e, i) => 
        i === existingIndex ? { ...e, count: newCount } : e
      );
    } else {
      newEntries = [...entries, { date: today, count: newCount }];
    }
    
    newEntries = newEntries.filter(e => e.count > 0);
    setEntries(newEntries);
    saveData(newEntries, yearlyGoal);
  };

  const addBacklogEntry = () => {
    if (!backlogDate || backlogCount <= 0) return;
    
    const existingIndex = entries.findIndex(e => e.date === backlogDate);
    let newEntries;
    
    if (existingIndex >= 0) {
      newEntries = entries.map((e, i) => 
        i === existingIndex ? { ...e, count: e.count + backlogCount } : e
      );
    } else {
      newEntries = [...entries, { date: backlogDate, count: backlogCount }];
    }
    
    if (backlogDate === today) {
      const newTodayEntry = newEntries.find(e => e.date === today);
      setTodayCount(newTodayEntry ? newTodayEntry.count : 0);
    }
    
    setEntries(newEntries);
    saveData(newEntries, yearlyGoal);
    setBacklogCount(0);
    setBacklogDate('');
  };

  const deleteEntry = (date) => {
    const newEntries = entries.filter(e => e.date !== date);
    setEntries(newEntries);
    if (date === today) setTodayCount(0);
    saveData(newEntries, yearlyGoal);
  };

  const saveGoal = () => {
    setYearlyGoal(tempGoal);
    saveData(entries, tempGoal);
    setShowSettings(false);
  };

  // Calculate stats
  const yearEntries = entries.filter(e => e.date.startsWith(currentYear.toString()));
  const totalThisYear = yearEntries.reduce((sum, e) => sum + e.count, 0);
  const progress = Math.min((totalThisYear / yearlyGoal) * 100, 100);
  
  const dayOfYear = Math.floor((new Date() - new Date(currentYear, 0, 0)) / (1000 * 60 * 60 * 24));
  const daysInYear = ((currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0) ? 366 : 365;
  const expectedByNow = Math.round((yearlyGoal / daysInYear) * dayOfYear);
  const dailyAverage = yearEntries.length > 0 ? Math.round(totalThisYear / yearEntries.length) : 0;
  const daysRemaining = daysInYear - dayOfYear;
  const neededPerDay = daysRemaining > 0 ? Math.ceil((yearlyGoal - totalThisYear) / daysRemaining) : 0;

  // Streak calculation
  const sortedEntries = [...yearEntries].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  let checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const entry = sortedEntries.find(e => e.date === dateStr);
    if (entry && entry.count > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calendar helpers
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const entry = entries.find(e => e.date === dateStr);
      days.push({ day: i, date: dateStr, count: entry ? entry.count : 0 });
    }
    return days;
  };

  const getCountColor = (count) => {
    if (count === 0) return 'bg-purple-950/30';
    if (count < 25) return 'bg-purple-700/50';
    if (count < 50) return 'bg-purple-600/70';
    if (count < 75) return 'bg-purple-500/80';
    return 'bg-fuchsia-500';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(calendarMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCalendarMonth(newDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="animate-pulse text-purple-300 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 p-4 sm:p-6">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">OnlyPushups</h1>
          <button 
            onClick={() => { setTempGoal(yearlyGoal); setShowSettings(true); }}
            className="p-2 rounded-full bg-purple-800/50 hover:bg-purple-700/50 transition-colors"
          >
            <Settings className="w-5 h-5 text-purple-300" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-purple-900/40 rounded-xl p-1 border border-purple-700/30">
          {[
            { id: 'today', label: 'Today', icon: Target },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'backlog', label: 'Backlog', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-purple-400 hover:text-purple-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Today Tab */}
        {activeTab === 'today' && (
          <>
            {/* Main Counter Card */}
            <div className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 backdrop-blur-sm rounded-3xl p-6 border border-purple-700/30 shadow-xl">
              <p className="text-purple-300 text-sm font-medium text-center mb-2">TODAY</p>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => addPushups(-25)}
                  className="w-12 h-12 rounded-full bg-purple-700/50 hover:bg-purple-600/50 flex items-center justify-center transition-all active:scale-95"
                >
                  <Minus className="w-6 h-6 text-white" />
                </button>
                <div className="text-center">
                  <span className="text-6xl font-bold text-white tabular-nums">{todayCount}</span>
                  <p className="text-purple-400 text-sm mt-1">push-ups</p>
                </div>
                <button 
                  onClick={() => addPushups(25)}
                  className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-400 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-purple-500/30"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>
              
              {/* Quick add buttons - increments of 25 */}
              <div className="flex justify-center gap-2 mt-4">
                {[25, 50, 75, 100].map(num => (
                  <button
                    key={num}
                    onClick={() => addPushups(num)}
                    className="px-3 py-1.5 rounded-full bg-purple-700/30 hover:bg-purple-600/40 text-purple-200 text-sm font-medium transition-all"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Yearly Progress */}
            <div className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-5 border border-purple-700/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-200 font-medium">{currentYear} Goal</span>
                </div>
                <span className="text-white font-bold">{totalThisYear.toLocaleString()} / {yearlyGoal.toLocaleString()}</span>
              </div>
              
              <div className="relative h-4 bg-purple-950/50 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute inset-y-0 w-0.5 bg-purple-300/50"
                  style={{ left: `${Math.min((expectedByNow / yearlyGoal) * 100, 100)}%` }}
                  title="Expected progress"
                />
              </div>
              
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-purple-400">{progress.toFixed(1)}% complete</span>
                <span className={totalThisYear >= expectedByNow ? "text-green-400" : "text-amber-400"}>
                  {totalThisYear >= expectedByNow ? "On track! ✓" : `${(expectedByNow - totalThisYear).toLocaleString()} behind`}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-purple-400 text-sm">Streak</span>
                </div>
                <p className="text-2xl font-bold text-white">{streak} <span className="text-sm font-normal text-purple-400">days</span></p>
              </div>
              
              <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-purple-400 text-sm">Daily Avg</span>
                </div>
                <p className="text-2xl font-bold text-white">{dailyAverage}</p>
              </div>
              
              <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-purple-400 text-sm">Days Active</span>
                </div>
                <p className="text-2xl font-bold text-white">{yearEntries.length}</p>
              </div>
              
              <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/20">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-purple-400 text-sm">Need/Day</span>
                </div>
                <p className="text-2xl font-bold text-white">{Math.max(0, neededPerDay)}</p>
              </div>
            </div>

            {/* History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between bg-purple-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-700/20 hover:bg-purple-700/30 transition-colors"
            >
              <span className="text-purple-200 font-medium">Recent History</span>
              {showHistory ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
            </button>

            {/* History List */}
            {showHistory && (
              <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl border border-purple-700/20 overflow-hidden">
                {sortedEntries.length === 0 ? (
                  <p className="text-purple-400 text-center py-6">No entries yet. Start tracking!</p>
                ) : (
                  <div className="divide-y divide-purple-700/30">
                    {sortedEntries.slice(0, 10).map(entry => (
                      <div key={entry.date} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-purple-200 font-bold">{entry.count}</span>
                          <button 
                            onClick={() => deleteEntry(entry.date)}
                            className="p-1.5 rounded-full hover:bg-purple-700/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-purple-400 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-700/30">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full hover:bg-purple-700/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-purple-300" />
              </button>
              <h2 className="text-lg font-semibold text-white">
                {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full hover:bg-purple-700/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-purple-300" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-purple-400 text-xs font-medium py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                    day ? getCountColor(day.count) : 'bg-transparent'
                  } ${day?.date === today ? 'ring-2 ring-fuchsia-400' : ''}`}
                >
                  {day && (
                    <>
                      <span className={`font-medium ${day.count > 0 ? 'text-white' : 'text-purple-400'}`}>
                        {day.day}
                      </span>
                      {day.count > 0 && (
                        <span className="text-[10px] text-purple-200 font-bold">{day.count}</span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-purple-700/30">
              <span className="text-purple-400 text-xs">Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-purple-950/30"></div>
                <div className="w-4 h-4 rounded bg-purple-700/50"></div>
                <div className="w-4 h-4 rounded bg-purple-600/70"></div>
                <div className="w-4 h-4 rounded bg-purple-500/80"></div>
                <div className="w-4 h-4 rounded bg-fuchsia-500"></div>
              </div>
              <span className="text-purple-400 text-xs">More</span>
            </div>

            {/* Monthly Stats */}
            <div className="mt-4 pt-4 border-t border-purple-700/30">
              <div className="flex justify-between text-sm">
                <span className="text-purple-400">This month:</span>
                <span className="text-white font-bold">
                  {entries
                    .filter(e => e.date.startsWith(`${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}`))
                    .reduce((sum, e) => sum + e.count, 0)
                    .toLocaleString()} push-ups
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Backlog Tab */}
        {activeTab === 'backlog' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-800/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-5 border border-purple-700/30">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Log Past Push-ups
              </h2>
              
              {/* Date Picker */}
              <div className="mb-4">
                <label className="text-purple-300 text-sm font-medium block mb-2">Select Date</label>
                <input
                  type="date"
                  value={backlogDate}
                  max={today}
                  onChange={(e) => setBacklogDate(e.target.value)}
                  className="w-full bg-purple-950/50 border border-purple-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Count Input */}
              <div className="mb-4">
                <label className="text-purple-300 text-sm font-medium block mb-2">Number of Push-ups</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBacklogCount(Math.max(0, backlogCount - 25))}
                    className="w-12 h-12 rounded-full bg-purple-700/50 hover:bg-purple-600/50 flex items-center justify-center transition-all"
                  >
                    <Minus className="w-5 h-5 text-white" />
                  </button>
                  <input
                    type="number"
                    value={backlogCount}
                    onChange={(e) => setBacklogCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-purple-950/50 border border-purple-700/50 rounded-xl px-4 py-3 text-white text-center text-xl font-bold focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => setBacklogCount(backlogCount + 25)}
                    className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-400 flex items-center justify-center transition-all shadow-lg shadow-purple-500/30"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Quick add buttons */}
              <div className="flex justify-center gap-2 mb-4">
                {[25, 50, 75, 100].map(num => (
                  <button
                    key={num}
                    onClick={() => setBacklogCount(backlogCount + num)}
                    className="px-3 py-1.5 rounded-full bg-purple-700/30 hover:bg-purple-600/40 text-purple-200 text-sm font-medium transition-all"
                  >
                    +{num}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={addBacklogEntry}
                disabled={!backlogDate || backlogCount <= 0}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Log
              </button>

              {backlogDate && entries.find(e => e.date === backlogDate) && (
                <p className="text-purple-400 text-sm text-center mt-3">
                  Note: This will add to existing {entries.find(e => e.date === backlogDate)?.count} push-ups on this date
                </p>
              )}
            </div>

            {/* Recent entries for reference */}
            <div className="bg-purple-800/30 backdrop-blur-sm rounded-xl border border-purple-700/20 overflow-hidden">
              <div className="px-4 py-3 border-b border-purple-700/30">
                <h3 className="text-purple-200 font-medium">Recent Entries</h3>
              </div>
              {sortedEntries.length === 0 ? (
                <p className="text-purple-400 text-center py-6">No entries yet</p>
              ) : (
                <div className="divide-y divide-purple-700/30 max-h-64 overflow-y-auto">
                  {sortedEntries.slice(0, 15).map(entry => (
                    <div key={entry.date} className="flex items-center justify-between px-4 py-3">
                      <p className="text-white font-medium">
                        {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-200 font-bold">{entry.count}</span>
                        <button 
                          onClick={() => deleteEntry(entry.date)}
                          className="p-1.5 rounded-full hover:bg-purple-700/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-purple-400 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900 to-purple-950 rounded-2xl p-6 w-full max-w-sm border border-purple-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-1 rounded-full hover:bg-purple-800">
                  <X className="w-5 h-5 text-purple-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-purple-300 text-sm font-medium block mb-2">Yearly Goal</label>
                  <input
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(parseInt(e.target.value) || 0)}
                    className="w-full bg-purple-950/50 border border-purple-700/50 rounded-xl px-4 py-3 text-white text-lg font-medium focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  {[10000, 15000, 20000, 25000].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setTempGoal(preset)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tempGoal === preset 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50'
                      }`}
                    >
                      {(preset / 1000)}k
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={saveGoal}
                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
