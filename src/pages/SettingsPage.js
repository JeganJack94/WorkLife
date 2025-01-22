import React, { useState, useEffect } from 'react';
import { User, Camera, Save } from 'lucide-react';

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    name: '',
    plannedBalance: 20,
    sickBalance: 10,
    profileImage: null
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('worklife-profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('worklife-profile', JSON.stringify(profile));
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
    toast.textContent = 'Settings saved successfully!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#CE93D8] to-[#8E24AA] flex items-center justify-center overflow-hidden">
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-white" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
              <Camera className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <InputField
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Planned Leave Balance"
              type="number"
              value={profile.plannedBalance}
              onChange={(e) => setProfile(prev => ({ ...prev, plannedBalance: e.target.value }))}
              min="0"
            />
            <InputField
              label="Sick Leave Balance"
              type="number"
              value={profile.sickBalance}
              onChange={(e) => setProfile(prev => ({ ...prev, sickBalance: e.target.value }))}
              min="0"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#CE93D8] to-[#8E24AA] text-white py-3 rounded-lg
                     hover:opacity-90 transition-opacity flex items-center justify-center space-x-2
                     font-medium shadow-lg"
        >
          <Save className="w-5 h-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#CE93D8] 
                 focus:border-transparent transition-all duration-200 outline-none"
    />
  </div>
);

export default SettingsPage;