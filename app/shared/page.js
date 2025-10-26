'use client';


import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Suspense } from "react";


function SharePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const audioId = searchParams.get('audioId');
    const userId = useRef(0);
    const username = useRef("");

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
                    router.push(`/library/?audioId=${audioId}`);

                    await addAudiotoUser();
                } else {
                    console.log('Session check failed with status:', response.status);
                    localStorage.removeItem('sessionToken');
                    router.push('/library');
                    // setLoggedIn(0);
                }
            } catch (error) {
                localStorage.removeItem('sessionToken');
                router.push('/library');
            } 
        };

        const addAudiotoUser = async () => {
            console.log('Adding audio to user:', audioId, userId);
            try {
                const response = await axios.post('https://pondemand-b26dced7fb8b.herokuapp.com/add_audio_to_user', {
                    audioId: audioId,
                    userId: userId.current
                });

                if (response.status === 200) {
                    console.log('Audio added to user:', response.data);
                } else {
                    console.log('Audio add failed with status:', response.status);
                }
            }
            catch (error) {
                console.error('Audio add failed:', error);
            }
        }


        checkSession(localStorage.getItem('sessionToken'));


    }, []);

    //check if shared file exists in shared collection




    return (
        <div className="flex items-center justify-center min-h-screen">
            <h1>Loading the shared conversation in your library...</h1>
        </div>
    );
};

export default function Share() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SharePage />
        </Suspense>
    )
}
