'use client';

import Head from 'next/head';
import Nav from '../components/Nav';
import MediaClips from '../components/MediaClips';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from '../components/signin';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Fade } from '@mui/material';
import CustomWelcome from '../components/CustomMsg';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const Library = () => {
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const checkSession = async (token) => {
      try {
        const response = await axios.get('https://pondemand-b26dced7fb8b.herokuapp.com/check_session', {
          headers: { 'Authorization': token },
        });

        if (response.status === 200) {
          setUserId(response.data.userid);
          setUsername(response.data.name);
          setLoggedIn(1);
        } else {
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

    setFadeIn(true); // Trigger fade-in animation
  }, []);

    const onSuccess = (userid, user_name) => {
        setUserId(userid);
        setUsername(user_name);
        // userId.current = userid;
        // username.current = user_name;
        console.log('Login successful:', username);
        setLoggedIn(1);
    };

    const onSuccessLogout = () => {
        localStorage.removeItem('sessionToken');
        setLoggedIn(0);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-xl">Loading...</h1>
            </div>
        );
    }

  return (
    <div>
    {/* <Box sx={{ 
      background: 'linear-gradient(45deg, #2A2A2A, #1A1A1A)', 
      minHeight: '100vh', 
      color: 'white',
      paddingBottom: '40px' 
    }}>
      <Head>
        <title>Library</title>
        <style>
          {`
            .navbar-fixed {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              z-index: 1000;
              background: linear-gradient(45deg, #2A2A2A, #1A1A1A);
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .page-content {
              margin-top: 80px;
            }
          `}
        </style>
      </Head>
    </Box> */}

        
        {loggedIn === 0 && (
                <div>
                <Nav isLoggedIn={loggedIn}/>
                <div className="flex flex-col items-center min-h-screen p-16">
                    <h1 className="text-5xl text-white text-center pb-8">
                        Create Conversations for your Curiosity
                    </h1>
                    <GoogleOAuthProvider clientId={clientId}>
                        <div>
                            <GoogleLoginButton onSuccess={onSuccess} />
                        </div>
                    </GoogleOAuthProvider>
                </div>
                </div>
        )}
        {loggedIn === 1 && (
            <div>

            <Nav isLoggedIn={loggedIn}/>
            <div>
                {/* <Head>
                    <title>Pondemand </title>
                    <meta name="description" content="" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <link rel="icon" href="../public/favicon.ico" type="image/x-icon"/>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                    <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
                </Head> */}
                {/* <main> */}
                    {/* <CustomWelcome username={username.current} /> */}
                    {/* <MediaClips userId = {userId.current}/> */}

                <CustomWelcome username={username} />
                <MediaClips userId = {userId}/>
                {/* </main> */}
            </div>
            </div>
        )} 
        </div>

    );
}


export default Library;