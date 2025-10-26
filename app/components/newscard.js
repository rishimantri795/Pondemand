'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LinkIcon from '@mui/icons-material/Link';

import FavoriteIcon from '@mui/icons-material/Favorite';
import IosShareIcon from '@mui/icons-material/IosShare';
import axios from 'axios';
import { Headphones, PlayCircle, Share2 } from 'lucide-react';


const NewsCard = (props) => {   

  const [liked, setLiked] = useState(false);
  const [s3url, setS3url] = useState('');
  const [date, setDate] = useState('');
  
  const linkClick = () => {
    console.log('Link clicked');
    const href = props.file['source'];
    if (href === 'notNews') {
      return;
    }
    else
    {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const shareClick = () => {
    let shareLink = '';
    if (props.userId === 0) {
      shareLink = window.location.origin + '/focus/' + props.file['id'];
    } else {
      shareLink = window.location.origin + '/focus/' + props.file['id'] + '/' + props.userId;
    }
    navigator.clipboard.writeText(shareLink).then(() => {
      console.log('Link copied to clipboard:', shareLink);
      alert('Link copied to clipboard');
    }).catch(error => {
      console.error('Error copying link to clipboard:', error);
    });

    console.log('Share clicked');

  };
  
  let link = '';

  if (props.userId === 0) {
    link = '/focus/' + props.file['id'];
    // link = '';
  } else {
    link = '/focus/' + props.file['id'] + '/' + props.userId;
    // link = '';
  }

  useEffect(() => {
    const path = props.file['path'];
    //axios.get(`http://localhost:5001/${path}`)
    
    
    axios.get(`https://pondemand-b26dced7fb8b.herokuapp.com/${path}`)
    .then(response => {
      setS3url(response.data['url']);
      // console.log('S3 URL:', response.data['url']);
      const formattedDate = props.file['date'].slice(0,-13);
      setDate(formattedDate);
    })
    .catch(error => {
      console.error('Error fetching audio files:', error);
    });
    
    
  }, []);


  // return (
  //   <div>
  //       <div style={styles.container}>
  //       <div style={styles.card}>
  //           <Headphones className="w-8 h-8" />

  //           <div style={styles.header}>
              
  //           <Link href={link}>
  //             <h2 style={styles.title}>{props.file['title']}</h2>

  //           </Link>
  //           {/* <span style={styles.date}>{date}</span> */}
  //           </div>
  //           {/* <p style={styles.summary}>{props.file['summary']}</p> */}
  //           <div style={styles.cardDrawer}>
  //             <IosShareIcon style={{ color: 'rgb(255,255,255)', fontSize: '24px', cursor:'pointer', paddingBottom:'5px' }} onClick={shareClick} />

  //             <LinkIcon style={{ color: 'rgb(255,255,255)', fontSize: '20px', cursor:'pointer' }} onClick ={linkClick}/>
  //           </div>
  //           {/* <a href={props.file['source']} target="_blank" rel="noopener noreferrer" styles={styles.source}>
  //          Learn More 
  //           </a> */}
  //       </div>
  //       <div style={styles.audioContainer}>
  //           <audio 
  //           controls 
  //           // src={`http://localhost:5001/${props.file['path']}`}

  //           src={s3url}
  //           style={styles.audio}
  //           >
  //           Your browser does not support the audio element.
  //           </audio>
  //       </div>
  //       </div>
        
  //   </div>
    
  // );
// };


return (
  <main className="container mx-auto border-black" >
            <div className="bg-white border-black text-[rgb(0,128,132)] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Headphones className="w-8 h-8" />
                </div>
                
                <Link href={link} className="text-xl font-bold mb-2 underline ">{props.file['title']}
                </Link>
                <div className="flex justify-between items-center mt-4">
                  <h1 className='flex row items-center cursor-pointer' onClick={() => props.clickHandler(props.file)}>
                   {/* <h2 style={styles.title}>{props.file['title']}</h2> */}
                      <PlayCircle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Listen Now</span>
                  </h1>
                  
                  {/* <button 
                    onClick={() => alert(`Sharing: ${audio.title}`)}
                    className="text-[rgb(0,128,132)] hover:text-[rgb(0,100,104)] transition-colors duration-300"
                  > */}
                    <Share2 className="w-5 h-5 cursor-pointer" onClick={shareClick}/>
                  {/* </button> */}
                </div>
              </div>
            </div>
      </main>
    );


  };


const styles = {
  container: {
    width: '100%',
    margin: '20px auto',
    //fontFamily: 'Arial, sans-serif',
    // bordercolor: 'rgb(0,128,132)',
    bordercolor: 'rgb(255,255,255)',
    borderRadius: '8px',
    display: 'flex',
  },
  card: {
    padding: '20px',
    borderRadius: '8px 8px 0 0',
    bordercolor: 'rgb(255,255,255)', 
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgb(0,128,132)',
  },
  cardDrawer: {
    display: 'flex',
    marginTop: '10px',
    gap: '15px',
  },
  title: {
    fontSize: '23px',
    fontWeight: 'bold',
    color: 'rgb(255,255,255)',
    textDecoration: 'underline',
  },
  summary: {
    fontSize: '15px',
    marginBottom: '15px',
    color: 'rgb(255,255,255)',
    lineHeight: '1.4',
  },
  audioContainer: {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  audio: {
    width: '100%',
  },
    dateContainer: {
    position: 'relative',
    top: '10px',
    right: '15px',
  },
    header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },
  date: {
    fontSize: '14px',
    color: 'rgb(255,255,255)',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '3px 8px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
  },
  source: {
    color: 'rgb(255,255,255)',
    fontSize: '14px',
  },
};


export default NewsCard;
