'use client';

import Head from 'next/head';
import Nav from '../components/Nav';
import TodoApp from '../components/TodoApp';

import AudioPlayer from '../components/MediaPlayer';

import MediaClips from '../components/MediaClips';

import '../styles/globals.css';

import { useState, useEffect } from 'react';  
import axios from 'axios';


const Main = () => {


  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState("");

  const [loggedIn, setLoggedIn] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
      const checkSession = async (token) => {
          try {
              console.log('Checking session...');
              const response = await axios.get('https://pondemand-b26dced7fb8b.herokuapp.com/check_session', {
                  headers: {
                      'Authorization': token
                  }
              });
                
              if (response.status === 200) {
                  setUserId(response.data.userid);
                  setUsername(response.data.name);
                    // userId.current = response.data.userid;
                    // username.current = response.data.name;
                  console.log('Session check successful:', response.data);
                  setLoggedIn(1);
              } else {
                  console.log('Session check failed with status:', response.status);
                  localStorage.removeItem('sessionToken');
                  setLoggedIn(0);
              }
          } catch (error) {
              console.error('Session check failed:', error);
              localStorage.removeItem('sessionToken');
              setLoggedIn(0);
          } finally {
              setIsLoading(false);
          }
      };

      const token = localStorage.getItem('sessionToken');
      if (token) {
          checkSession(token);
      } else {
          setLoggedIn(0);
          setIsLoading(false);
      }
  }, []);

  if (isLoading) {
      return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-xl">Loading...</h1>
            </div>
        );
  }

  return (
    <div>
      <Head>
        <title>Pondemand </title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.ico" type="image/x-icon"/>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </Head>
      <Nav isLoggedIn={loggedIn}/>
      <main style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
        
        {/* <TodoApp /> */}
        <MediaClips userId = {0}/>
      </main>
    </div>
  );
}

export default Main;