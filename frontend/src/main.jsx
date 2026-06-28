import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          gutter={10}
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            },
            success: {
              iconTheme: { primary: "#10a37f", secondary: "var(--bg-card)" },
              duration: 3000,
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "var(--bg-card)" },
              duration: 4000,
            },
          }}
        />
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
