import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Render the app
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(<App />);

// Set up theme initialization
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  // Apply dark mode for Tailwind
  if (savedTheme === "dark" || savedTheme === "villain") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

// Initialize theme on load
initializeTheme();
