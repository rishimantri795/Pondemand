'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';

const Page = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [audioData, setAudioData] = useState(null);
    const [s3url, setS3url] = useState(null);
    const [conversationLines, setConversationLines] = useState([]);

    const params = useParams();

    const { id, user } = params;
    
    useEffect(() => {
        const fetchAudioData = async () => {
            try {
                const response = await axios.get(`https://pondemand-b26dced7fb8b.herokuapp.com/get_user_audio_file/${id}/${user}`);
                setAudioData(response.data);
                console.log(response.data);
                const path = response.data['path'];
                setConversationLines(response.data['lines']);
                const s3Response = await axios.get(`https://pondemand-b26dced7fb8b.herokuapp.com/${path}`);
        
                setS3url(s3Response.data['url']);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAudioData();
    }, [id]);

    const handleBackClick = () => {
        window.history.back();
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error.message}</div>;

    return (
        <div className="article-page">
            <button className="back-button" onClick={handleBackClick}>
                ← 
            </button>
            <div className="article-container">
                <h1 className="article-title">{audioData?.title}</h1>
                <p className="article-date">{audioData?.date}</p>
                <div className="article-summary">{audioData?.summary}</div>
                <div className="audio-player">
                    <audio controls src={s3url}>
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <h2>Transcript:</h2>
                <div className="article-transcript">
                    {conversationLines?.map((line, index) => (
                        <p key={index}>{line}</p>
                    ))}
                </div>
                
                {audioData?.source != "notNews" && (
                    <div className='items-center text-[rgb(0,128,132)] underline py-2'> 
                        <a className='flex items-center' href={audioData.source} target="_blank" rel="noopener noreferrer">
                             Learn More
                             <div className='ml-2'>
                            </div>  
                             <ExternalLink size={16} />
                        </a>
                    </div>
                )}
            </div>
            <style jsx>{`
                .article-page {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    min-height: 100vh;
                    padding: 20px;
                }
                .back-button {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background-color: #006D77;
                    color: white;
                    border: none;
                    padding: 10px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                }
                .back-button:hover {
                    background-color: #005a63;
                }
                .article-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 30px;
                }
                .article-title {
                    font-size: 28px;
                    color: #006D77;
                    margin-bottom: 10px;
                }
                .article-date {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 20px;
                }
                .article-summary {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333;
                    margin-bottom: 20px;
                }
                .audio-player {
                    margin-bottom: 20px;
                }
                .audio-player audio {
                    width: 100%;
                }
                .article-transcript {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #444;
                }
                .loading, .error {
                    text-align: center;
                    font-size: 18px;
                    color: #006D77;
                    margin-top: 50px;
                }
            `}</style>
        </div>
    );
}

export default Page;