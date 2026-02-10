import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      {/* Attribution text - Apple-style minimalist branding */}
      <div className="w-full text-center py-2 px-4">
        <p className="text-[10px] text-gray-400 font-light tracking-wide">
          Made by a CS student specializing in machine learning · Volta™
        </p>
      </div>
      <Routes />
    </AuthProvider>
  );
}

export default App;
