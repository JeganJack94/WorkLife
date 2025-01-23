import React, { useState, useEffect, useRef } from "react";
import { User, Camera, Save, Check, Trash2 } from "lucide-react";

const usePersistedState = (key, initialValue) => {
  const [state, setState] = useState(() => {
    try {
      const savedItem = localStorage.getItem(key);
      return savedItem ? JSON.parse(savedItem) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }, 300); // Debounce to 300ms

    return () => clearTimeout(timer);
  }, [key, state]);

  return [state, setState];
};

const SettingsPage = () => {
  const [profile, setProfile] = usePersistedState("worklife-user-settings", {
    name: "",
    plannedBalance: 20,
    sickBalance: 10,
    profileImage: null,
  });
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    try {
      window.dispatchEvent(new Event("storage")); // Sync changes across tabs
      setToast({ message: "Settings saved successfully!", type: "success" });
      setTimeout(() => setToast(null), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setToast({ message: "Failed to save settings. Please try again.", type: "error" });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSettings = () => {
    localStorage.removeItem("worklife-user-settings");
    setProfile({
      name: "",
      plannedBalance: 20,
      sickBalance: 10,
      profileImage: null,
    });
    setToast({ message: "Settings cleared successfully!", type: "success" });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}
        >
          <Check className="w-5 h-5" />
          <span className="text-sm truncate">{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center overflow-hidden">
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
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <InputField
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InputField
              label="Planned Leave Balance"
              type="number"
              value={profile.plannedBalance}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  plannedBalance: parseInt(e.target.value) || 0,
                }))
              }
              min="0"
            />
            <InputField
              label="Sick Leave Balance"
              type="number"
              value={profile.sickBalance}
              onChange={(e) =>
                setProfile((prev) => ({
                  ...prev,
                  sickBalance: parseInt(e.target.value) || 0,
                }))
              }
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-between space-x-2">
          <button
            onClick={clearSettings}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 font-medium shadow-lg text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Settings</span>
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 font-medium shadow-lg text-sm sm:text-base"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      {...props}
      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all duration-200 outline-none"
    />
  </div>
);

export default SettingsPage;
