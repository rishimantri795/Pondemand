'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  Tooltip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Slider as HeroSlider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Switch from 'react-switch';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleLoadingScreen from './LoadingScreen';
import { style } from 'framer-motion/client';
import { 
  Mic, 
  MicOff, 
  Upload, 
  Settings, 
  Info, 
  Check, 
  Close, 
  ExpandMore, 
  ExpandLess,
  Add,
  FileUpload,
  PlayArrow,
  Stop,
  HelpOutline
} from '@mui/icons-material';

// Create a custom styled HeroUI slider (using MUI's Slider as a base)
const CustomHeroSlider = styled(HeroSlider)({
  color: '#4a90e2',
  height: 4, // Thinner track for a more elegant look
  '& .MuiSlider-track': {
    border: 'none',
    background: 'linear-gradient(90deg, #4a90e2 0%, #357ABD 100%)',
  },
  '& .MuiSlider-rail': {
    opacity: 0.15, // More subtle rail
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  '& .MuiSlider-thumb': {
    height: 20, // Slightly smaller thumb
    width: 20,
    backgroundColor: '#ffffff', // White thumb for contrast
    border: '2px solid #4a90e2', // Blue border
    boxShadow: '0 0 0 0 rgba(74, 144, 226, 0.3)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother animation
    '&:hover': {
      boxShadow: '0 0 0 6px rgba(74, 144, 226, 0.12)',
      transform: 'scale(1.1)',
    },
    '&.Mui-active': {
      boxShadow: '0 0 0 10px rgba(74, 144, 226, 0.12)',
      transform: 'scale(1.2)',
    },
  },
  '& .MuiSlider-mark': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 4,
    width: 1, // Thinner marks
    '&.MuiSlider-markActive': {
      backgroundColor: '#4a90e2',
    },
  },
  '& .MuiSlider-markLabel': {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.7rem',
    fontWeight: '400',
    marginTop: '4px',
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: 'transparent',
    color: '#4a90e2',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0',
    '&:before': {
      display: 'none',
    },
    '&:after': {
      display: 'none',
    },
  },
});

// Modern tab styles
const customTabStyles = {
  tabList: {
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 0',
    marginBottom: '20px',
    borderBottom: 'none',
  },
  tab: {
    padding: '12px 24px',
    cursor: 'pointer',
    borderRadius: '12px',
    backgroundColor: 'rgba(42, 42, 42, 0.7)',
    color: '#fff',
    margin: '0 8px',
    fontWeight: '500',
    textAlign: 'center',
    outline: 'none',
    border: 'none',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  activeTab: {
    backgroundColor: '#4a90e2',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(74, 144, 226, 0.4)',
    transform: 'translateY(-2px)',
  },
  tabContent: {
    padding: '20px',
    backgroundColor: 'transparent',
    color: '#fff',
  },
};

// Animation variants
const fadeInAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

const slideInAnimation = {
  initial: { x: -20, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

const styles = [
  {
    name: "Casual",
    description:
      "Imagine listening in on two friends chatting. One's curious and easygoing, the other's energetic and relatable. They're talking about something interesting, and the conversation just flows naturally, like they're not even trying.",
  },
  {
    name: "Interview",
    description:
      "Imagine a deep dive discussion with a knowledgeable expert and a sharp, unbiased interviewer. Its a well-researched, structured, and informative conversation, packed with insightful analysis of the topic at hand.",
  },
  {
    name: "Debate",
    description:
      "Imagine a spirited debate where two individuals passionately argue opposing sides of an issue. It's a lively and informative exchange as they challenge each other's points, presenting evidence to defend their positions and push back against the other's arguments.",
  },
  {
    name: "Free Form",
    description:
      "Describe the desired style, length, and audience in the topic or instructions",
  },
];

const TodoApp = ({ userId, onDone }) => {
  const [isNewsTopic, setIsNewsTopic] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [instructionInput, setInstructionInput] = useState('');
  const [file, setFile] = useState(null);
  const [credits, setCredits] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(styles[0]);
  const [length, setLength] = useState(4);
  const [selectedVoice2, setSelectedVoice2] = useState('Mason');
  const [selectedVoice1, setSelectedVoice1] = useState('Jennifer');
  const [showCustomization, setShowCustomization] = useState(false);
  const [isRecording1, setIsRecording1] = useState(false);
  const [isRecording2, setIsRecording2] = useState(false);
  const [recordingMode1, setRecordingMode1] = useState('upload');
  const [recordingMode2, setRecordingMode2] = useState('upload');
  const [mediaRecorder1, setMediaRecorder1] = useState(null);
  const [mediaRecorder2, setMediaRecorder2] = useState(null);
  const [audioChunks1, setAudioChunks1] = useState([]);
  const [audioChunks2, setAudioChunks2] = useState([]);
  const [recordingText1, setRecordingText1] = useState('');
  const [recordingText2, setRecordingText2] = useState('');
  const [recordingTime1, setRecordingTime1] = useState(0);
  const [recordingTime2, setRecordingTime2] = useState(0);
  const [uploadedVoice1, setUploadedVoice1] = useState(null);
  const [uploadedVoice2, setUploadedVoice2] = useState(null);

  // Ref for scrolling to the bottom
  const conversationRef = useRef(null);
  const loadingScreenRef = useRef(null);

  useEffect(() => {
    axios
      .get(`https://pondemand-b26dced7fb8b.herokuapp.com/check_credits/${userId}`)
      .then((response) => setCredits(response.data['credits']))
      .catch((error) => console.error('Error checking credits:', error));
  }, [userId]);

  useEffect(() => {
    if (status === 'PENDING' && taskId) {
      const interval = setInterval(async () => {
        try {
          console.log('Checking status for task:', taskId);
          axios
            .get(`https://pondemand-b26dced7fb8b.herokuapp.com/get_task_status/${taskId}`)
            .then((response) => {
              if (response.data['status'] === 'SUCCESS') {
                setStatus('SUCCESS');
                console.log('Task completed successfully!');
                setIsLoading((prevIsLoading) => !prevIsLoading);
                setInputValue('');
                setInstructionInput('');
                setFile(null);
                setSelectedVoice1('Jennifer');
                setSelectedVoice2('Mason');
                setLength(4);

                // const creditsResponse = axios.get(`https://pondemand-b26dced7fb8b.herokuapp.com/check_credits/${userId}`)
                //   .then((response) => setCredits(creditsResponse.data['credits']))
                //   .catch((error) => console.error('Error checking credits:', error));

                
                onDone();
              } else if (response.data['status'] === 'FAILED') {
                setStatus('FAILED');
                console.log('Task failed!');
                setError('There was an error in the worker scripts to add the article!');
                setIsLoading((prevIsLoading) => !prevIsLoading);
              } else if (response.data['status'] === 'PENDING') {
                console.log('Task is still pending...');
              }
            })
            .catch((error) => {
              console.error('Error checking status:', error);
            });
        } catch (error) {
          console.error('Error checking status:', error);
        }
      }, 10000);

      return () => clearInterval(interval);
    } else {
      return;
    }
  }, [status]);

  const handleToggleChange = (checked) => {
    setIsNewsTopic(checked);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInstructionInputChange = (e) => {
    setInstructionInput(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const addTodo = async () => {
    if (credits <= 0) {
      setError('You have no credits left!');
      return;
    }

    if (status === 'PENDING') {
      setError('Please wait for the current task to complete!');
      return;
    }


    if (activeTab === 0 && !inputValue.trim() && !instructionInput.trim()) {
      setError('Please enter a topic or instructions!');
      return;
    }

    if (activeTab === 1 && !file) {
      setError('Please upload a file!');
      return;
    }

    if (selectedVoice1 === 'Your Own' && !uploadedVoice1) {
      setError('Please upload or record Voice 1!');
      return;
    }

    if (selectedVoice2 === 'Your Own' && !uploadedVoice2) {
      setError('Please upload or record Voice 2!');
      return;
    }

    // Toggle loading state
    setIsLoading(true);
    setError('');

    try {

      if (file) {
      
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('instructionInput', instructionInput);
        formData.append('style', selectedStyle.name);

        if (selectedVoice1 === 'Your Own') {
          if (!uploadedVoice1) {
            setError('Please upload or record Voice 1');
            setIsLoading(false);
            return;
          }
          formData.append('voice1_file', uploadedVoice1);
          formData.append('voice1_type', 'custom');
        } else {
          formData.append('voice1_type', 'preset');
          formData.append('voice1', selectedVoice1);
        }
  
        // Handle voice2
        if (selectedVoice2 === 'Your Own') {
          if (!uploadedVoice2) {
            setError('Please upload or record Voice 2');
            setIsLoading(false);
            return;
          }
          formData.append('voice2_file', uploadedVoice2);
          formData.append('voice2_type', 'custom');
        } else {
          formData.append('voice2_type', 'preset');
          formData.append('voice2', selectedVoice2);
        }

        const response = await axios.post(
          'https://pondemand-b26dced7fb8b.herokuapp.com/add_todo_file',
          // 'localhost:5000/add_todo_file',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (response.data['title'] === 'Error') {
          setIsLoading(false);
          setError('There was an error in the python scripts to add the article!');
          return;
        }

        setTaskId(response.data['task_id']);
        setStatus('PENDING');
      } else {
        if (inputValue.trim() || instructionInput.trim()) {

          let requestData = {
            topic: inputValue,
            userId: userId,
            activeTab: activeTab,
            isNewsTopic: isNewsTopic,
            style: selectedStyle.name,
            length: length,
          };

          let formData = new FormData();

          if (selectedVoice1 === 'Your Own' || selectedVoice2 === 'Your Own') {
            formData = new FormData();
            
            // Add base data
            Object.keys(requestData).forEach(key => {
              formData.append(key, requestData[key]);
            });
  
            // Handle Voice 1
            if (selectedVoice1 === 'Your Own') {
              if (!uploadedVoice1) {
                setError('Please upload or record Voice 1');
                setIsLoading(false);
                return;
              }
              formData.append('voice1_file', uploadedVoice1);
              formData.append('voice1_type', 'custom');
            } else {
              formData.append('voice1_type', 'preset');
              formData.append('voice1', selectedVoice1);
            }
  
            // Handle Voice 2
            if (selectedVoice2 === 'Your Own') {
              if (!uploadedVoice2) {
                setError('Please upload or record Voice 2');
                setIsLoading(false);
                return;
              }
              formData.append('voice2_file', uploadedVoice2);
              formData.append('voice2_type', 'custom');
            } else {
              formData.append('voice2_type', 'preset');
              formData.append('voice2', selectedVoice2);
            }
  
            // Send FormData request
            
          } else {
            // Both voices are presets, use JSON request
            requestData.voice1_type = 'preset';
            requestData.voice1 = selectedVoice1;
            requestData.voice2_type = 'preset';
            requestData.voice2 = selectedVoice2;
  
            
          }  

          const response = await axios.post(
            'https://pondemand-b26dced7fb8b.herokuapp.com/add_todo',
            selectedVoice1 === 'Your Own' || selectedVoice2 === 'Your Own' ? formData : requestData,
            {
              headers: { 'Content-Type': selectedVoice1 === 'Your Own' || selectedVoice2 === 'Your Own'
                ? 'multipart/form-data'
                : 'application/json' 
              }
            }
          );

          
      

          if (response.data['title'] === 'Error') {
            setIsLoading(false);
            setError('There was an error in the python scripts to add the article!');
            return;
          }

          setTaskId(response.data['task_id']);
          setStatus('PENDING');
        }
      }
    } catch (error) {
      console.error('Error adding the article:', error);
      setIsLoading(false);
    } finally {
      console.log('in finally');
    }
  };

  // Update recording prompts with instructions
  const recordingInstructions = [
    "The AI will mimic everything in your voice - speed, tone, breathing, and even background noise. Keep your voice consistent throughout the recording. Speak naturally but maintain a steady volume and tone. The recording will automatically stop at 30 seconds.",
    "For best results, maintain a consistent speaking style. The AI will replicate your exact performance, including your speaking speed and emotional tone. Keep your voice steady and natural. The recording will automatically stop at 30 seconds.",
    "Remember that the AI will capture all aspects of your voice. Maintain a consistent tone and volume throughout. Avoid sudden changes in your delivery. The recording will automatically stop at 30 seconds.",
    "Speak naturally but consistently. The AI will try to replicate your exact performance, including your speaking style and breathing patterns. Keep your voice steady. The recording will automatically stop at 30 seconds.",
    "For optimal results, maintain a consistent speaking voice. The AI will mimic everything it hears, including your tone and delivery style. Keep your performance steady. The recording will automatically stop at 30 seconds."
  ];

  const audioChunks1Ref = useRef([]);
const audioChunks2Ref = useRef([]);

const startRecording = async (voiceNumber) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    recordingTimeRef.current = 0; // Reset recording time
    
    if (voiceNumber === 1) {
      setRecordingTime1(0); // Reset recording time for voice 1
      setMediaRecorder1(recorder);
      audioChunks1Ref.current = []; // Reset chunks
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks1Ref.current.push(event.data);
        }
      };
      
      recorder.start(1000); // Collect data every second
      setRecordingText1(recordingInstructions[Math.floor(Math.random() * recordingInstructions.length)]);
      setIsRecording1(true);
    } else {
      // Similar changes for voice 2
      setRecordingTime2(0); // Reset recording time for voice 2
      setMediaRecorder2(recorder);
      audioChunks2Ref.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks2Ref.current.push(event.data);
        }
      };
      
      recorder.start(1000);
      setRecordingText2(recordingInstructions[Math.floor(Math.random() * recordingInstructions.length)]);
      setIsRecording2(true);
    }
  } catch (error) {
    console.error('Error accessing microphone:', error);
  }
};

  const stopRecording = useCallback((voiceNumber) => {
    if (voiceNumber === 1 && mediaRecorder1 && isRecording1) {
      mediaRecorder1.stop();
      mediaRecorder1.stream.getTracks().forEach(track => track.stop());
  
      const currentTime = recordingTimeRef.current;
      
      if (currentTime >= 30) {
        const audioBlob = new Blob(audioChunks1Ref.current, { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], 'recorded_voice1.mp3', { type: 'audio/mp3' });
        setUploadedVoice1(audioFile);
        const url = URL.createObjectURL(audioFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recorded_voice2.mp3';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        audioChunks1Ref.current = []; // Reset chunks
        setUploadedVoice1(null); // Reset uploaded voice
      }
      setIsRecording1(false);
      setRecordingTime1(0);
      recordingTimeRef.current = 0; // Reset ref to avoid stale value
    }
    else if (voiceNumber === 2 && mediaRecorder2 && isRecording2) {
      mediaRecorder2.stop();
      mediaRecorder2.stream.getTracks().forEach(track => track.stop());
  
      const currentTime = recordingTimeRef.current;
  
      if (currentTime >= 30) {
        const audioBlob = new Blob(audioChunks2Ref.current, { type: 'audio/mp3' });
        const audioFile = new File([audioBlob], 'recorded_voice2.mp3', { type: 'audio/mp3' });
        setUploadedVoice2(audioFile);
      } else {
        audioChunks2Ref.current = []; // Reset chunks
        setUploadedVoice2(null); // Reset uploaded voice
      }
      setIsRecording2(false);
      setRecordingTime2(0);
      recordingTimeRef.current = 0; // Reset ref to avoid stale value
    }
  }, [mediaRecorder1, mediaRecorder2, isRecording1, isRecording2]);

  const recordingTimeRef = useRef(0);


  useEffect(() => {
    let interval;
    if (isRecording1) {
      interval = setInterval(() => {
        setRecordingTime1(prev => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime; // Update ref with latest time
          if (newTime >= 30) {
            stopRecording(1);
            return 30;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording1, stopRecording]);

  useEffect(() => {
    let interval;
    if (isRecording2) {
      interval = setInterval(() => {
        setRecordingTime2(prev => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime; // Update ref with latest time
          if (newTime >= 30) {
            stopRecording(2);
            return 30;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording2, stopRecording]);

  // Update the timer display to show progress towards 30 seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} / 0:30`;
  };

  // Add handleVoiceUpload functions
  const handleVoice1Upload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedVoice1(file);
    }
  };

  const handleVoice2Upload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedVoice2(file);
      // You can add additional validation or processing here
    }
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '2rem 0',
        fontFamily: "'Inter', 'Outfit', sans-serif",
        position: 'relative', // Add position relative
      }}
    >
      <style>
        {`
          body { 
            margin: 0; 
            font-family: 'Inter', 'Outfit', sans-serif;
          }
          .react-tabs__tab--selected::after { display: none; }
          .react-tabs__tab-list { border-bottom: none !important; }
          .custom-file-upload {
            display: flex;
            align-items: center;
            gap: 15px;
            color: white;
            margin-bottom: 20px;
          }
          .custom-file-upload span {
            color: white;
            font-size: 1rem;
            font-weight: 500;
          }
          .MuiTextField-root {
            background-color: rgba(42, 42, 42, 0.7);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }
          .MuiOutlinedInput-root {
            border-radius: 12px !important;
          }
          .MuiButton-root {
            text-transform: none !important;
            font-weight: 500 !important;
            letter-spacing: 0.5px !important;
          }
          .MuiTypography-root {
            font-family: 'Inter', 'Outfit', sans-serif !important;
          }
        `}
      </style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
        {/* Left Side - Main Controls */}
        <motion.div 
          {...fadeInAnimation}
          style={{ 
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Tabs Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              backgroundColor: 'rgba(42, 42, 42, 0.3)', 
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Tabs selectedIndex={activeTab} onSelect={(index) => setActiveTab(index)}>
              <TabList style={customTabStyles.tabList}>
                <Tab
                  style={{
                    ...customTabStyles.tab,
                    ...(activeTab === 0 ? customTabStyles.activeTab : {}),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>Describe</span>
                    <Tooltip title="Enter a topic or description for your podcast">
                      <Info sx={{ fontSize: 16, opacity: 0.7 }} />
                    </Tooltip>
                  </Box>
                </Tab>
                <Tab
                  style={{
                    ...customTabStyles.tab,
                    ...(activeTab === 1 ? customTabStyles.activeTab : {}),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>File Upload</span>
                    <Tooltip title="Upload documents to generate a podcast from">
                      <Info sx={{ fontSize: 16, opacity: 0.7 }} />
                    </Tooltip>
                  </Box>
                </Tab>
              </TabList>

              {/* Describe Tab */}
              <TabPanel style={customTabStyles.tabContent}>
                <motion.div 
                  {...fadeInAnimation}
                  style={{ padding: '10px 0' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    <TextField
                      value={inputValue}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Enter your podcast topic or description here..."
                      InputProps={{
                        style: {
                          color: inputValue ? 'white' : 'rgba(255, 255, 255, 0.6)',
                          fontSize: '1rem',
                          padding: '12px 16px',
                          lineHeight: '1.5',
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          border: '1px solid rgba(74, 144, 226, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            border: '1px solid rgba(74, 144, 226, 0.5)',
                          },
                          '&.Mui-focused': { 
                            border: '1px solid #4a90e2',
                            boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.2)',
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.4)',
                          opacity: 1,
                          fontSize: '0.95rem',
                          fontStyle: 'italic',
                        },
                      }}
                    />
                  </div>
                </motion.div>
              </TabPanel>

              {/* File Upload Tab */}
              <TabPanel style={customTabStyles.tabContent}>
                <motion.div 
                  {...fadeInAnimation}
                  style={{ padding: '10px 0' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Row 1: File Upload Button & File Name */}
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: 'rgba(42, 42, 42, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px dashed rgba(74, 144, 226, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: '1px dashed rgba(74, 144, 226, 0.6)',
                          backgroundColor: 'rgba(42, 42, 42, 0.4)',
                        },
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          justifyContent: 'flex-start',
                          width: '100%',
                        }}
                      >
                        <Button
                          component="label"
                          variant="contained"
                          sx={{
                            backgroundColor: '#4a90e2',
                            color: 'white',
                            minWidth: '48px',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            padding: '0',
                            '&:hover': {
                              backgroundColor: '#357ABD',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <FileUpload />
                          <input
                            type="file"
                            hidden
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                          />
                        </Button>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              color: file ? 'white' : 'rgba(255, 255, 255, 0.6)',
                              fontWeight: '500',
                              fontSize: '0.95rem',
                            }}
                          >
                            {file ? file.name : 'No file chosen'}
                          </Typography>
                          <Typography
                            sx={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.8rem',
                              mt: 0.5,
                            }}
                          >
                            {file ? 'PDF file selected' : 'Upload a PDF document (max 10MB)'}
                          </Typography>
                        </Box>
                      </div>
                    </Paper>
                    
                    {/* Row 2: Instruction Text Field */}
                    <TextField
                      value={instructionInput}
                      onChange={handleInstructionInputChange}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Add specific instructions for how the hosts should approach this topic..."
                      InputProps={{
                        style: {
                          color: instructionInput ? 'white' : 'rgba(255, 255, 255, 0.6)',
                          fontSize: '1rem',
                          padding: '12px 16px',
                          lineHeight: '1.5',
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          border: '1px solid rgba(74, 144, 226, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            border: '1px solid rgba(74, 144, 226, 0.5)',
                          },
                          '&.Mui-focused': { 
                            border: '1px solid #4a90e2',
                            boxShadow: '0 0 0 2px rgba(74, 144, 226, 0.2)',
                          },
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'rgba(255, 255, 255, 0.4)',
                          opacity: 1,
                          fontSize: '0.95rem',
                          fontStyle: 'italic',
                        },
                      }}
                    />
                  </div>
                </motion.div>
              </TabPanel>
            </Tabs>
          </Paper>

          {/* Controls Section */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'rgba(42, 42, 42, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* News Topic Toggle and Credits */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: 'rgba(42, 42, 42, 0.5)',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Switch
                    onChange={handleToggleChange}
                    checked={isNewsTopic}
                    onColor="#4a90e2"
                    offColor="#555"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    height={20}
                    width={40}
                  />
                  <Typography
                    sx={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: 'white',
                    }}
                  >
                    News Topic
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'rgba(42, 42, 42, 0.5)',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: '500',
                      color: '#ffffff',
                      fontSize: '15px',
                    }}
                  >
                    {credits} Credits
                  </Typography>
                  <Tooltip title="Credits remaining for today">
                    <Info sx={{ fontSize: 16, opacity: 0.7, color: 'white' }} />
                  </Tooltip>
                </Box>
              </Box>

              {/* Conversation Length Slider (only for Describe Tab) */}
              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mb: 3,
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}
                    >
                      Conversation Length
                    </Typography>
                    <Box 
                      sx={{ 
                        backgroundColor: 'rgba(74, 144, 226, 0.1)', 
                        color: '#4a90e2',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        letterSpacing: '0.5px',
                      }}
                    >
                      <span>{length}</span>
                      <span>min</span>
                    </Box>
                  </Box>
                  
                  <Box sx={{ px: 2, py: 1 }}>
                    <CustomHeroSlider
                      aria-label="Length of Conversation"
                      value={length}
                      onChange={(e, value) => setLength(value)}
                      step={2}
                      marks={[
                        { value: 2, label: '2' },
                        { value: 4, label: '4' },
                        { value: 6, label: '6' },
                        { value: 8, label: '8' },
                        { value: 10, label: '10' },
                      ]}
                      min={2}
                      max={10}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => `${value} min`}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      width: '100%',
                      mt: 1,
                      px: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        fontWeight: '400',
                        letterSpacing: '0.5px',
                      }}
                    >
                      SHORT
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.75rem',
                        fontWeight: '400',
                        letterSpacing: '0.5px',
                      }}
                    >
                      LONG
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Generate Button */}
            <Button
              variant="contained"
              onClick={addTodo}
              sx={{
                backgroundColor: '#4a90e2',
                color: 'white',
                fontWeight: '500',
                height: '48px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                '&:hover': {
                  backgroundColor: '#357ABD',
                  boxShadow: '0 6px 16px rgba(74, 144, 226, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
                mt: 2,
              }}
            >
              Generate Podcast
            </Button>
          </Paper>
        </motion.div>

        {/* Right Side - Voice and Style Selection */}
        <motion.div 
          {...fadeInAnimation}
          style={{ 
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'rgba(42, 42, 42, 0.3)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              height: '100%',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                mb: 3,
                textAlign: 'center',
              }}
            >
              Voice Selection
            </Typography>
            
            <div className="flex flex-col md:flex-row md:justify-center gap-8">
              {/* Voice 1 Selection */}
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: 'rgba(42, 42, 42, 0.5)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  width: '100%',
                  maxWidth: '400px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    mb: 2,
                    textAlign: 'center',
                  }}
                >
                  Voice 1
                </Typography>
                
                <div className="grid grid-cols-2 gap-4">
                  {['Jennifer', 'Mason', 'Charlie', 'Your Own'].map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setSelectedVoice1(voice)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: selectedVoice1 === voice ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '12px',
                      }}
                    >
                      <div 
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          border: selectedVoice1 === voice 
                            ? '2px solid #4a90e2' 
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: selectedVoice1 === voice 
                            ? 'rgba(74, 144, 226, 0.1)' 
                            : 'rgba(42, 42, 42, 0.7)',
                        }}
                      >
                        {voice === 'Your Own' ? (
                          <Add sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 28 }} />
                        ) : (
                          <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: '500' }}>
                            {voice[0]}
                          </Typography>
                        )}
                      </div>
                      <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                        {voice}
                      </Typography>
                    </button>
                  ))}
                </div>
                
                {selectedVoice1 === 'Your Own' && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <Button
                        onClick={() => setRecordingMode1('upload')}
                        variant={recordingMode1 === 'upload' ? 'contained' : 'outlined'}
                        sx={{
                          flex: 1,
                          backgroundColor: recordingMode1 === 'upload' ? '#4a90e2' : 'transparent',
                          color: 'white',
                          borderColor: recordingMode1 === 'upload' ? '#4a90e2' : 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            backgroundColor: recordingMode1 === 'upload' ? '#357ABD' : 'rgba(74, 144, 226, 0.1)',
                            borderColor: recordingMode1 === 'upload' ? '#357ABD' : 'rgba(74, 144, 226, 0.5)',
                          },
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: '500',
                        }}
                      >
                        Upload File
                      </Button>
                      <Button
                        onClick={() => setRecordingMode1('record')}
                        variant={recordingMode1 === 'record' ? 'contained' : 'outlined'}
                        sx={{
                          flex: 1,
                          backgroundColor: recordingMode1 === 'record' ? '#4a90e2' : 'transparent',
                          color: 'white',
                          borderColor: recordingMode1 === 'record' ? '#4a90e2' : 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            backgroundColor: recordingMode1 === 'record' ? '#357ABD' : 'rgba(74, 144, 226, 0.1)',
                            borderColor: recordingMode1 === 'record' ? '#357ABD' : 'rgba(74, 144, 226, 0.5)',
                          },
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: '500',
                        }}
                      >
                        Record Voice
                      </Button>
                    </Box>
                    
                    {recordingMode1 === 'upload' ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          component="label"
                          variant="outlined"
                          sx={{
                            borderColor: 'rgba(74, 144, 226, 0.5)',
                            color: 'white',
                            '&:hover': {
                              borderColor: '#4a90e2',
                              backgroundColor: 'rgba(74, 144, 226, 0.1)',
                            },
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: '500',
                          }}
                        >
                          Choose Audio File
                          <input
                            type="file"
                            hidden
                            accept="audio/mp3"
                            onChange={handleVoice1Upload}
                          />
                        </Button>
                        {uploadedVoice1 && (
                          <Paper
                            elevation={0}
                            sx={{
                              backgroundColor: 'rgba(42, 42, 42, 0.7)',
                              borderRadius: '8px',
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Check sx={{ color: '#4a90e2', fontSize: 20 }} />
                            <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                              {uploadedVoice1.name}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!isRecording1 ? (
                          <Button
                            onClick={() => startRecording(1)}
                            variant="contained"
                            startIcon={<Mic />}
                            sx={{
                              backgroundColor: '#4a90e2',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#357ABD',
                              },
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: '500',
                            }}
                          >
                            Start Recording
                          </Button>
                        ) : (
                          <>
                            <Paper
                              elevation={0}
                              sx={{
                                backgroundColor: 'rgba(42, 42, 42, 0.7)',
                                borderRadius: '12px',
                                padding: '16px',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '1.5rem',
                                  fontWeight: 'bold',
                                  color: '#4a90e2',
                                  mb: 1,
                                }}
                              >
                                {formatTime(recordingTime1)}
                              </Typography>
                              <Typography
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  mb: 2,
                                  fontSize: '0.9rem',
                                }}
                              >
                                {recordingText1}
                              </Typography>
                              <Button
                                onClick={() => stopRecording(1)}
                                variant="contained"
                                startIcon={<Stop />}
                                sx={{
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#c82333',
                                  },
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: '500',
                                }}
                              >
                                Stop Recording
                              </Button>
                            </Paper>
                            <Paper
                              elevation={0}
                              sx={{
                                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                                borderRadius: '12px',
                                padding: '12px',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.85rem',
                                  mb: 1,
                                  fontWeight: '500',
                                }}
                              >
                                Tips for best results:
                              </Typography>
                              <ul style={{ 
                                color: 'rgba(255, 255, 255, 0.6)', 
                                fontSize: '0.8rem',
                                margin: '0 0 0 16px',
                                padding: 0,
                              }}>
                                <li>Maintain consistent volume and tone</li>
                                <li>Speak naturally and clearly</li>
                                <li>Avoid sudden changes in delivery</li>
                                <li>Keep background noise to a minimum</li>
                              </ul>
                            </Paper>
                          </>
                        )}
                        {uploadedVoice1 && (
                          <Paper
                            elevation={0}
                            sx={{
                              backgroundColor: 'rgba(42, 42, 42, 0.7)',
                              borderRadius: '8px',
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Check sx={{ color: '#4a90e2', fontSize: 20 }} />
                            <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                              {uploadedVoice1.name}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>

              {/* Voice 2 Selection - Similar to Voice 1 */}
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: 'rgba(42, 42, 42, 0.5)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  width: '100%',
                  maxWidth: '400px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'white',
                    mb: 2,
                    textAlign: 'center',
                  }}
                >
                  Voice 2
                </Typography>
                
                <div className="grid grid-cols-2 gap-4">
                  {['Jennifer', 'Mason', 'Charlie', 'Your Own'].map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setSelectedVoice2(voice)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: selectedVoice2 === voice ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '12px',
                      }}
                    >
                      <div 
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          border: selectedVoice2 === voice 
                            ? '2px solid #4a90e2' 
                            : '1px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: selectedVoice2 === voice 
                            ? 'rgba(74, 144, 226, 0.1)' 
                            : 'rgba(42, 42, 42, 0.7)',
                        }}
                      >
                        {voice === 'Your Own' ? (
                          <Add sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 28 }} />
                        ) : (
                          <Typography sx={{ color: 'white', fontSize: '1.5rem', fontWeight: '500' }}>
                            {voice[0]}
                          </Typography>
                        )}
                      </div>
                      <Typography sx={{ color: 'white', fontSize: '0.9rem', fontWeight: '500' }}>
                        {voice}
                      </Typography>
                    </button>
                  ))}
                </div>
                
                {selectedVoice2 === 'Your Own' && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <Button
                        onClick={() => setRecordingMode2('upload')}
                        variant={recordingMode2 === 'upload' ? 'contained' : 'outlined'}
                        sx={{
                          flex: 1,
                          backgroundColor: recordingMode2 === 'upload' ? '#4a90e2' : 'transparent',
                          color: 'white',
                          borderColor: recordingMode2 === 'upload' ? '#4a90e2' : 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            backgroundColor: recordingMode2 === 'upload' ? '#357ABD' : 'rgba(74, 144, 226, 0.1)',
                            borderColor: recordingMode2 === 'upload' ? '#357ABD' : 'rgba(74, 144, 226, 0.5)',
                          },
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: '500',
                        }}
                      >
                        Upload File
                      </Button>
                      <Button
                        onClick={() => setRecordingMode2('record')}
                        variant={recordingMode2 === 'record' ? 'contained' : 'outlined'}
                        sx={{
                          flex: 1,
                          backgroundColor: recordingMode2 === 'record' ? '#4a90e2' : 'transparent',
                          color: 'white',
                          borderColor: recordingMode2 === 'record' ? '#4a90e2' : 'rgba(255, 255, 255, 0.3)',
                          '&:hover': {
                            backgroundColor: recordingMode2 === 'record' ? '#357ABD' : 'rgba(74, 144, 226, 0.1)',
                            borderColor: recordingMode2 === 'record' ? '#357ABD' : 'rgba(74, 144, 226, 0.5)',
                          },
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: '500',
                        }}
                      >
                        Record Voice
                      </Button>
                    </Box>
                    
                    {recordingMode2 === 'upload' ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          component="label"
                          variant="outlined"
                          sx={{
                            borderColor: 'rgba(74, 144, 226, 0.5)',
                            color: 'white',
                            '&:hover': {
                              borderColor: '#4a90e2',
                              backgroundColor: 'rgba(74, 144, 226, 0.1)',
                            },
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: '500',
                          }}
                        >
                          Choose Audio File
                          <input
                            type="file"
                            hidden
                            accept="audio/*"
                            onChange={handleVoice2Upload}
                          />
                        </Button>
                        {uploadedVoice2 && (
                          <Paper
                            elevation={0}
                            sx={{
                              backgroundColor: 'rgba(42, 42, 42, 0.7)',
                              borderRadius: '8px',
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Check sx={{ color: '#4a90e2', fontSize: 20 }} />
                            <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                              {uploadedVoice2.name}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {!isRecording2 ? (
                          <Button
                            onClick={() => startRecording(2)}
                            variant="contained"
                            startIcon={<Mic />}
                            sx={{
                              backgroundColor: '#4a90e2',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: '#357ABD',
                              },
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: '500',
                            }}
                          >
                            Start Recording
                          </Button>
                        ) : (
                          <>
                            <Paper
                              elevation={0}
                              sx={{
                                backgroundColor: 'rgba(42, 42, 42, 0.7)',
                                borderRadius: '12px',
                                padding: '16px',
                                textAlign: 'center',
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '1.5rem',
                                  fontWeight: 'bold',
                                  color: '#4a90e2',
                                  mb: 1,
                                }}
                              >
                                {formatTime(recordingTime2)}
                              </Typography>
                              <Typography
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.8)',
                                  mb: 2,
                                  fontSize: '0.9rem',
                                }}
                              >
                                {recordingText2}
                              </Typography>
                              <Button
                                onClick={() => stopRecording(2)}
                                variant="contained"
                                startIcon={<Stop />}
                                sx={{
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  '&:hover': {
                                    backgroundColor: '#c82333',
                                  },
                                  borderRadius: '8px',
                                  textTransform: 'none',
                                  fontWeight: '500',
                                }}
                              >
                                Stop Recording
                              </Button>
                            </Paper>
                            <Paper
                              elevation={0}
                              sx={{
                                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                                borderRadius: '12px',
                                padding: '12px',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.85rem',
                                  mb: 1,
                                  fontWeight: '500',
                                }}
                              >
                                Tips for best results:
                              </Typography>
                              <ul style={{ 
                                color: 'rgba(255, 255, 255, 0.6)', 
                                fontSize: '0.8rem',
                                margin: '0 0 0 16px',
                                padding: 0,
                              }}>
                                <li>Maintain consistent volume and tone</li>
                                <li>Speak naturally and clearly</li>
                                <li>Avoid sudden changes in delivery</li>
                                <li>Keep background noise to a minimum</li>
                              </ul>
                            </Paper>
                          </>
                        )}
                        {uploadedVoice2 && (
                          <Paper
                            elevation={0}
                            sx={{
                              backgroundColor: 'rgba(42, 42, 42, 0.7)',
                              borderRadius: '8px',
                              padding: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Check sx={{ color: '#4a90e2', fontSize: 20 }} />
                            <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                              {uploadedVoice2.name}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </div>
            
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />
            
            <Typography
              sx={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'white',
                mb: 3,
                textAlign: 'center',
              }}
            >
              Conversation Style
            </Typography>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {styles.map((style) => (
                <Button
                  key={style.name}
                  onClick={() => setSelectedStyle(style)}
                  variant={selectedStyle.name === style.name ? 'contained' : 'outlined'}
                  sx={{
                    backgroundColor: selectedStyle.name === style.name ? '#4a90e2' : 'transparent',
                    color: 'white',
                    borderColor: selectedStyle.name === style.name ? '#4a90e2' : 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      backgroundColor: selectedStyle.name === style.name ? '#357ABD' : 'rgba(74, 144, 226, 0.1)',
                      borderColor: selectedStyle.name === style.name ? '#357ABD' : 'rgba(74, 144, 226, 0.5)',
                    },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: '500',
                    minWidth: '120px',
                  }}
                >
                  {style.name}
                </Button>
              ))}
            </div>
            
            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'rgba(42, 42, 42, 0.5)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(74, 144, 226, 0.3)',
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  textAlign: 'center',
                }}
              >
                {selectedStyle.description}
              </Typography>
            </Paper>
          </Paper>
        </motion.div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="errorMessage"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              color: '#dc3545',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              maxWidth: '600px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Close sx={{ fontSize: 20 }} />
            <Typography sx={{ fontWeight: '500' }}>{error}</Typography>
          </Paper>
        </motion.div>
      )}

      {/* Loading Screen */}
      {isLoading && <SimpleLoadingScreen />}
    </div>
  );
};

export default TodoApp;


