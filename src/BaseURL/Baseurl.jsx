// Automatically detects whether you are on localhost, 127.0.0.1, or a LAN IP
const getBaseURL = () => {
  const hostname = window.location.hostname; // Automatically gets '192.168.1.19', 'localhost', etc.
  const backendPort = '3000'; // Your backend server port

  // Dynamically build the URL
  return `http://${hostname}:${backendPort}`;
};

export const BaseURL = getBaseURL();   