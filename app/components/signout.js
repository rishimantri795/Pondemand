import React from 'react';
import { LogOut } from 'lucide-react';
import axios from 'axios';

const LogoutButton = ({ onLogoutSuccess }) => {
  const handleLogout = async () => {
    try {
        console.log(localStorage.getItem('sessionToken'))
      // Placeholder for actual logout API call
      // Replace this with your actual logout API call
      const response = await axios.post('https://pondemand-b26dced7fb8b.herokuapp.com/logout', {}, {
        headers: {
            'Authorization':localStorage.getItem('sessionToken')
        }
      });

      console.log(response)
      if (response.status ==200) {
        if (onLogoutSuccess) {
          onLogoutSuccess();
        }
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '20px',
        padding: '10px 18px',  // Increased padding
        fontSize: '16px',      // Increased font size
        width: '130px',         // Set a fixed width
        borderRadius: '20px',          // Added rounded corners
        cursor: 'pointer'
      }}
    >
      <LogOut className="mr-2" size={18} />
      Logout
    </button>
  );
};

export default LogoutButton;