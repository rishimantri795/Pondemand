'use client';

import TodoApp from '../components/TodoApp';
import Nav from '../components/Nav';
import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import GoogleLoginButton from '../components/signin';
import axios from 'axios';
import { Container } from '@mui/material';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
// Define page container styles similar to feedback page
const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1a1a',
    color: 'white',
    position: 'relative',
    fontFamily: "'Inter', 'Outfit', sans-serif"
  }
};

const ByYou = () => {
    const userId = useRef(0);
    const username = useRef("");
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
                    userId.current = response.data.userid;
                    username.current = response.data.name;
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

    const onSuccess = (userid, user_name) => {
        userId.current = userid;
        username.current = user_name;
        console.log('Login successful:', username.current);
        setLoggedIn(1);
    };

    const onGenerationDone = () => {
        setRefreshKey(refreshKey + 1);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: '#1a1a1a', color: 'white' }}>
                <h1 className="text-xl">Loading...</h1>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <Nav isLoggedIn={loggedIn} />
            <main style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                {loggedIn === 1 && (
                    <Container maxWidth="lg">
                        <TodoApp userId={userId.current} onDone={onGenerationDone} />
                    </Container>
                )}
                {loggedIn === 0 && (
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
                )}
            </main>
        </div>
    );
};

export default ByYou;