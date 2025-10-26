'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Divider,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Breadcrumbs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Business,
  CreditCard,
  Security,
  Notifications,
  History,
  Settings as SettingsIcon,
  StarRate,
  AutorenewRounded,
  AccountBalanceWallet,
  VerifiedUser,
  Description,
  BarChart,
  ArrowBack,
  Home,
  NavigateNext,
} from '@mui/icons-material';
import Link from 'next/link';

const SettingsPage = () => {
  // State for user data
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    companyName: '',
    planType: 'free',
    creditsLeft: 0,
    totalCredits: 100,
    nextRenewal: '',
    memberSince: '',
    profilePicture: '',
    userId: '',
    isAdmin: false,
    actualCredits: 0,
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // State for error messages
  const [error, setError] = useState(null);
  
  // State for user activity
  const [userActivity, setUserActivity] = useState([]);
  
  // State for profile edit dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedCompany, setEditedCompany] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // State for activity dialog
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [allUserActivity, setAllUserActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get authentication data from localStorage
        const sessionToken = localStorage.getItem('sessionToken');
        const storedUserName = localStorage.getItem('userName');
        const storedUserEmail = localStorage.getItem('userEmail');
        const storedUserCompany = localStorage.getItem('userCompany');
        
        if (!sessionToken) {
          // If no token, user is not logged in
          window.location.href = '/main';
          return;
        }
        
        // Check session and get user ID
        const sessionResponse = await fetch('https://pondemand-b26dced7fb8b.herokuapp.com/check_session', {
          headers: {
            'Authorization': sessionToken
          }
        });
        
        if (!sessionResponse.ok) {
          throw new Error('Failed to verify session');
        }
        
        const sessionData = await sessionResponse.json();
        const userId = sessionData.userid;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        // Fetch credits data
        const creditsResponse = await fetch(`https://pondemand-b26dced7fb8b.herokuapp.com/check_credits/${userId}`);
        
        if (!creditsResponse.ok) {
          throw new Error('Failed to fetch credit information');
        }
        
        const creditsData = await creditsResponse.json();
        const userCredits = creditsData.credits || 0;
        const isAdmin = userCredits >= 100; // Admin users have 100+ credits
        const totalCredits = 5; // Standard user credits limit
        
        // Calculate next renewal date (next day for regular users, next month for admins)
        const today = new Date();
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + 1);
        
        const nextMonth = new Date(today);
        nextMonth.setMonth(today.getMonth() + 1);
        
        // Set the member since date (either stored or a month ago)
        const memberSinceDate = new Date();
        memberSinceDate.setMonth(memberSinceDate.getMonth() - 1);
        
        // Set user data with real values
        setUserData({
          name: storedUserName || sessionData.name || 'User',
          email: storedUserEmail || sessionData.email || 'user@example.com',
          companyName: isAdmin ? 'Pondemand' : storedUserCompany || 'Your Company', // Assign "Pondemand" for admin users
          planType: isAdmin ? 'pro' : 'free', // Admin users are on Pro Plan, others on Free Plan
          creditsLeft: isAdmin ? totalCredits : Math.min(userCredits, totalCredits),
          totalCredits: totalCredits,
          nextRenewal: isAdmin ? nextMonth.toISOString().split('T')[0] : nextDay.toISOString().split('T')[0],
          memberSince: memberSinceDate.toISOString().split('T')[0],
          profilePicture: '',
          userId: userId,
          isAdmin: isAdmin,
          actualCredits: userCredits,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Extract creation date from file data with various possible field names
  const getCreationDate = (file) => {
    const possibleDateFields = ['created_at', 'date', 'timestamp', 'createdAt', 'creation_date', 'dateCreated'];
    
    for (const field of possibleDateFields) {
      if (file[field] && file[field] !== 'undefined' && file[field] !== 'null') {
        return formatDate(file[field]);
      }
    }
    
    // If we have a server_timestamp from Firestore
    if (file.server_timestamp && file.server_timestamp._seconds) {
      const timestamp = file.server_timestamp._seconds * 1000;
      return formatDate(timestamp);
    }
    
    // Fallback to a generic message
    return 'Date unavailable';
  };

  // Also fetch user activity data
  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!userData.userId) return;
      
      try {
        // Fetch recent audio files to display as activity
        const response = await fetch(`https://pondemand-b26dced7fb8b.herokuapp.com/get_user_audio_files/${userData.userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user activity');
        }
        
        const audioFiles = await response.json();
        console.log("Audio files data:", audioFiles); // Debug log to check the data structure
        
        // Convert audio files to activity items
        const activityItems = audioFiles.slice(0, 3).map(file => {
          return {
            action: `Created "${file.title || 'Audio'}"`,
            date: getCreationDate(file),
            credits: -1,
          };
        });
        
        setUserActivity(activityItems.length > 0 ? activityItems : [
          { action: 'No recent activity', date: 'Try creating some content', credits: 0 }
        ]);

        // Save all activity for the full view
        const allActivityItems = audioFiles.map(file => {
          return {
            action: `Created "${file.title || 'Audio'}"`,
            date: getCreationDate(file),
            credits: -1,
            type: 'audio',
            fileName: file.title || 'Untitled Audio',
            id: file.id || file.file_id || 'unknown'
          };
        });
        
        setAllUserActivity(allActivityItems.length > 0 ? allActivityItems : [
          { action: 'No activity found', date: 'Try creating some content', credits: 0, type: 'info' }
        ]);
      } catch (error) {
        console.error('Error fetching user activity:', error);
        // Don't set main error state, just show empty activity
        setUserActivity([
          { action: 'Failed to load activity', date: 'Please try again later', credits: 0 }
        ]);
        setAllUserActivity([
          { action: 'Failed to load activity', date: 'Please try again later', credits: 0, type: 'error' }
        ]);
      }
    };
    
    fetchUserActivity();
  }, [userData.userId]);
  
  // Format date string with better error handling and format detection
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date unavailable';
      
      // Try to convert various date formats
      let date;
      
      // Check if it's a timestamp (number)
      if (!isNaN(dateString)) {
        // If it's a Unix timestamp in seconds (10 digits), convert to milliseconds
        if (dateString.toString().length === 10) {
          date = new Date(parseInt(dateString) * 1000);
        } else {
          date = new Date(parseInt(dateString));
        }
      } 
      // Check if it's an ISO string or other string format
      else {
        date = new Date(dateString);
      }
      
      // Validate that the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format the date
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Date parsing error:", error, "for date string:", dateString);
      return 'Date unavailable';
    }
  };

  // Handle opening profile edit dialog
  const handleOpenProfileDialog = () => {
    setEditedName(userData.name);
    setEditedCompany(userData.isAdmin ? 'Pondemand' : userData.companyName);
    setProfileDialogOpen(true);
    setSaveSuccess(false);
  };
  
  // Handle saving profile changes
  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      // In a real implementation, this would update the data in Firebase
      // For now, just update the local state
      setTimeout(() => {
        setUserData({
          ...userData,
          name: editedName,
          companyName: userData.isAdmin ? 'Pondemand' : editedCompany // Ensure admin users keep Pondemand as company
        });
        
        // Update localStorage with new name and company
        localStorage.setItem('userName', editedName);
        localStorage.setItem('userCompany', userData.isAdmin ? 'Pondemand' : editedCompany);
        
        setSaveSuccess(true);
        // Close dialog after a delay
        setTimeout(() => {
          setProfileDialogOpen(false);
          setSaveLoading(false);
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate days until renewal
  const getDaysUntilRenewal = () => {
    const today = new Date();
    const renewalDate = new Date(userData.nextRenewal);
    const timeDifference = renewalDate.getTime() - today.getTime();
    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return dayDifference > 0 ? dayDifference : 0;
  };

  // Get tomorrow's date formatted for display
  const getTomorrowDate = () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return tomorrow.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Error generating tomorrow's date:", error);
      return 'Tomorrow';
    }
  };

  // Handle opening activity dialog
  const handleOpenActivityDialog = () => {
    setActivityLoading(true);
    setActivityDialogOpen(true);
    
    // Simulate loading additional activity data
    setTimeout(() => {
      setActivityLoading(false);
    }, 1000);
  };

  return (
    <Box sx={{ 
      backgroundColor: '#1A1A1A', 
      minHeight: '100vh',
      paddingTop: '40px',
      paddingBottom: '60px',
      fontFamily: "'Outfit', 'Inter', sans-serif",
    }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />} 
          aria-label="breadcrumb"
          sx={{ 
            mb: 3, 
            '& .MuiBreadcrumbs-ol': { 
              alignItems: 'center' 
            } 
          }}
        >
          <Link href="/main" style={{ textDecoration: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Home sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1rem', mr: 0.5 }} />
              <Typography sx={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '0.85rem',
                fontFamily: "'Outfit', 'Inter', sans-serif",
                '&:hover': { color: '#4a90e2' }
              }}>
                Home
              </Typography>
            </Box>
          </Link>
          <Typography sx={{ 
            color: '#4a90e2', 
            fontSize: '0.85rem',
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}>
            Account Settings
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#fff', 
                fontWeight: 600,
                fontFamily: "'Outfit', 'Inter', sans-serif",
              }}
            >
              Account Settings
            </Typography>
            <Link href="/main" style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBack />}
                sx={{ 
                  color: '#c4c4c4',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                Back to Home
              </Button>
            </Link>
          </Box>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            Manage your account, subscription, and preferences
          </Typography>
        </Box>

        {/* Settings Tabs */}
        <Paper 
          elevation={0} 
          sx={{ 
            backgroundColor: 'rgba(35, 35, 35, 0.6)', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            overflow: 'hidden',
            mb: 4,
          }}
        >
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.9rem',
                fontFamily: "'Outfit', 'Inter', sans-serif",
                padding: '16px 24px',
                minHeight: '48px',
              },
              '& .Mui-selected': {
                color: '#4a90e2',
                fontWeight: 600,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#4a90e2',
              },
            }}
          >
            <Tab label="Overview" icon={<SettingsIcon sx={{ fontSize: '1.2rem' }} />} iconPosition="start" />
            <Tab label="Subscription" icon={<StarRate sx={{ fontSize: '1.2rem' }} />} iconPosition="start" />
            <Tab label="Usage & Analytics" icon={<BarChart sx={{ fontSize: '1.2rem' }} />} iconPosition="start" />
            <Tab label="Billing" icon={<CreditCard sx={{ fontSize: '1.2rem' }} />} iconPosition="start" />
            <Tab label="Security" icon={<Security sx={{ fontSize: '1.2rem' }} />} iconPosition="start" />
          </Tabs>

          {/* Content Container */}
          <Box sx={{ p: { xs: 2, md: 4 } }}>
            {isLoading ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8
              }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    border: '3px solid rgba(74, 144, 226, 0.2)', 
                    borderTop: '3px solid #4a90e2', 
                    borderRadius: '50%',
                    animation: 'spin 1.5s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}/>
                </Box>
                <Typography sx={{ 
                  color: '#fff', 
                  fontWeight: 500,
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                }}>
                  Loading account information...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                py: 8
              }}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    backgroundColor: 'rgba(211, 47, 47, 0.1)', 
                    color: '#ff5252',
                    width: '100%',
                    maxWidth: 500,
                    '& .MuiAlert-icon': {
                      color: '#ff5252'
                    }
                  }}
                >
                  {error}
                </Alert>
                <Button 
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  sx={{ 
                    mt: 3,
                    color: '#4a90e2',
                    borderColor: 'rgba(74, 144, 226, 0.5)',
                    '&:hover': {
                      borderColor: '#4a90e2',
                      backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    }
                  }}
                >
                  Try Again
                </Button>
              </Box>
            ) : (
              <>
              {/* Overview Tab */}
              {activeTab === 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#fff',
                      fontWeight: 600,
                      mb: 3,
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}
                  >
                    Account Overview
                  </Typography>

                  <Grid container spacing={4}>
                    {/* Profile Card */}
                    <Grid item xs={12} md={4}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          p: 3,
                          height: '100%',
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                          <Avatar 
                            sx={{ 
                              width: 80, 
                              height: 80, 
                              mb: 2, 
                              bgcolor: userData.isAdmin ? '#ff9800' : '#4a90e2',
                              fontSize: '2rem',
                            }}
                          >
                            {userData.name ? userData.name[0].toUpperCase() : 'U'}
                          </Avatar>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#fff', 
                              fontWeight: 600,
                              textAlign: 'center',
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                            }}
                          >
                            {userData.name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.7)',
                              textAlign: 'center',
                              mb: 2,
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                            }}
                          >
                            {userData.email}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={userData.isAdmin ? "Pondemand Pro" : "Free Plan"} 
                              sx={{ 
                                backgroundColor: userData.isAdmin 
                                  ? 'rgba(74, 144, 226, 0.2)' 
                                  : 'rgba(255, 255, 255, 0.1)',
                                color: userData.isAdmin 
                                  ? '#4a90e2' 
                                  : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                              }}
                              icon={userData.isAdmin 
                                ? <VerifiedUser sx={{ fontSize: '1rem', color: '#4a90e2' }} /> 
                                : undefined}
                            />
                            {userData.isAdmin && (
                              <Chip 
                                label="Admin" 
                                sx={{ 
                                  backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                  color: '#ff9800',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  fontFamily: "'Outfit', 'Inter', sans-serif",
                                }}
                                icon={<StarRate sx={{ fontSize: '1rem', color: '#ff9800' }} />}
                              />
                            )}
                            <Chip 
                              label={`${userData.actualCredits} Credits`} 
                              sx={{ 
                                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                                color: '#4a90e2',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                              }}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)', my: 2 }} />

                        <List dense sx={{ py: 0 }}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <Business sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Company" 
                              secondary={userData.companyName}
                              primaryTypographyProps={{ 
                                sx: { 
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.8rem',
                                  fontFamily: "'Outfit', 'Inter', sans-serif",
                                },
                                component: "span"
                              }}
                              secondaryTypographyProps={{ 
                                sx: { 
                                  color: '#fff',
                                  fontFamily: "'Outfit', 'Inter', sans-serif",
                                },
                                component: "span"
                              }}
                            />
                          </ListItem>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <History sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Member Since" 
                              secondary={formatDate(userData.memberSince)}
                              primaryTypographyProps={{ 
                                sx: { 
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.8rem',
                                  fontFamily: "'Outfit', 'Inter', sans-serif",
                                },
                                component: "span"
                              }}
                              secondaryTypographyProps={{ 
                                sx: { 
                                  color: '#fff',
                                  fontFamily: "'Outfit', 'Inter', sans-serif",
                                },
                                component: "span"
                              }}
                            />
                          </ListItem>
                        </List>

                        <Button 
                          variant="outlined" 
                          fullWidth 
                          onClick={handleOpenProfileDialog}
                          sx={{ 
                            mt: 3,
                            color: '#c4c4c4',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontFamily: "'Outfit', 'Inter', sans-serif",
                            '&:hover': {
                              borderColor: 'rgba(255, 255, 255, 0.4)',
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            }
                          }}
                        >
                          Edit Profile
                        </Button>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                      <Grid container spacing={3}>
                        {/* Subscription Status */}
                        <Grid item xs={12}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              p: 3,
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'flex-start',
                              flexWrap: 'wrap',
                              gap: 2,
                            }}>
                              <Box>
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    color: '#fff', 
                                    fontWeight: 600,
                                    mb: 0.5,
                                    fontFamily: "'Outfit', 'Inter', sans-serif",
                                  }}
                                >
                                  {userData.isAdmin ? "Pondemand Pro Plan" : "Free Plan"}
                                </Typography>

                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    mb: 1,
                                    fontFamily: "'Outfit', 'Inter', sans-serif",
                                  }}
                                >
                                  {userData.isAdmin 
                                    ? "Enjoy unlimited access to all premium features and advanced content generation." 
                                    : "Upgrade to Pro for additional features and higher usage limits"}
                                </Typography>
                              </Box>

                              {userData.planType === 'free' ? (
                                <Button 
                                  variant="contained" 
                                  component={Link}
                                  href="/?tab=pro#pricing"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    background: 'linear-gradient(90deg, #4a90e2, #357ABD)',
                                    color: 'white',
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontFamily: "'Outfit', 'Inter', sans-serif",
                                    boxShadow: '0 4px 10px rgba(53, 122, 189, 0.3)',
                                    '&:hover': {
                                      background: 'linear-gradient(90deg, #357ABD, #2A6DB0)',
                                      boxShadow: '0 6px 15px rgba(53, 122, 189, 0.4)',
                                    },
                                  }}
                                >
                                  Upgrade to Pro
                                </Button>
                              ) : (
                                <Button 
                                  variant="outlined" 
                                  component={Link}
                                  href="/?tab=pro#pricing"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    color: '#c4c4c4',
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    fontFamily: "'Outfit', 'Inter', sans-serif",
                                    '&:hover': {
                                      borderColor: 'rgba(255, 255, 255, 0.4)',
                                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    }
                                  }}
                                >
                                  Manage Subscription
                                </Button>
                              )}
                            </Box>
                          </Paper>
                        </Grid>

                        {/* Credits Usage */}
                        <Grid item xs={12}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              p: 3,
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  color: '#fff', 
                                  fontWeight: 600,
                                  fontFamily: "'Outfit', 'Inter', sans-serif",
                                }}
                              >
                                Credits Usage
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccountBalanceWallet sx={{ color: userData.isAdmin ? '#ff9800' : '#4a90e2', fontSize: '1.2rem', mr: 1 }} />
                                <Typography 
                                  sx={{ 
                                    color: userData.isAdmin ? '#ff9800' : '#4a90e2', 
                                    fontWeight: 600,
                                    fontFamily: "'Outfit', 'Inter', sans-serif",
                                  }}
                                >
                                  {userData.isAdmin ? 'Unlimited' : `${userData.creditsLeft} / ${userData.totalCredits}`}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={userData.isAdmin ? 100 : (userData.creditsLeft / userData.totalCredits) * 100} 
                                sx={{ 
                                  height: 8, 
                                  borderRadius: 4,
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: userData.isAdmin ? '#ff9800' : '#4a90e2',
                                    borderRadius: 4,
                                  }
                                }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontFamily: "'Outfit', 'Inter', sans-serif",
                                }}
                              >
                                <AutorenewRounded sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />
                                {userData.isAdmin 
                                  ? 'Admin privileges' 
                                  : `Credits refresh tomorrow (${getTomorrowDate()})`}
                              </Typography>
                              {!userData.isAdmin && (
                                <Button 
                                  size="small"
                                  component={Link}
                                  href="/?tab=pro#pricing"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ 
                                    color: '#4a90e2',
                                    textTransform: 'none',
                                    fontFamily: "'Outfit', 'Inter', sans-serif",
                                    '&:hover': {
                                      backgroundColor: 'rgba(74, 144, 226, 0.1)',
                                    }
                                  }}
                                >
                                  Purchase Additional Credits
                                </Button>
                              )}
                            </Box>
                          </Paper>
                        </Grid>

                        {/* Recent Activity */}
                        <Grid item xs={12}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              p: 3,
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: '#fff', 
                                fontWeight: 600,
                                mb: 2,
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                              }}
                            >
                              Recent Activity
                            </Typography>

                            <List sx={{ p: 0 }}>
                              {userActivity.map((activity, index) => (
                                <React.Fragment key={index}>
                                  <ListItem 
                                    sx={{ 
                                      px: 0, 
                                      py: 1.5,
                                    }}
                                  >
                                    <ListItemText 
                                      primary={activity.action} 
                                      secondary={activity.date}
                                      primaryTypographyProps={{ 
                                        sx: { 
                                          color: '#fff',
                                          fontFamily: "'Outfit', 'Inter', sans-serif",
                                        },
                                        component: "span"
                                      }}
                                      secondaryTypographyProps={{ 
                                        sx: { 
                                          color: 'rgba(255, 255, 255, 0.5)',
                                          fontSize: '0.75rem',
                                          fontFamily: "'Outfit', 'Inter', sans-serif",
                                        },
                                        component: "span"
                                      }}
                                    />
                                    {activity.credits !== 0 && (
                                      <Chip 
                                        label={activity.credits > 0 ? `+${activity.credits}` : activity.credits} 
                                        size="small"
                                        sx={{ 
                                          backgroundColor: activity.credits > 0 ? 'rgba(46, 174, 79, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                          color: activity.credits > 0 ? '#2eae4f' : 'rgba(255, 255, 255, 0.7)',
                                          fontWeight: 600,
                                          fontSize: '0.7rem',
                                          height: '24px',
                                          fontFamily: "'Outfit', 'Inter', sans-serif",
                                        }}
                                      />
                                    )}
                                  </ListItem>
                                  {index < userActivity.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />}
                                </React.Fragment>
                              ))}
                            </List>

                            <Button 
                              fullWidth 
                              onClick={handleOpenActivityDialog}
                              sx={{ 
                                mt: 2,
                                color: '#c4c4c4',
                                textTransform: 'none',
                                fontWeight: 500,
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                }
                              }}
                            >
                              View All Activity
                            </Button>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Subscription Tab - Placeholder */}
              {activeTab === 1 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                    Subscription Details
                  </Typography>
                  <Alert severity="info" sx={{ backgroundColor: 'rgba(74, 144, 226, 0.1)', color: '#fff', mb: 3 }}>
                    This tab would include subscription plan details, features, and upgrade options
                  </Alert>
                </Box>
              )}

              {/* Usage & Analytics Tab - Placeholder */}
              {activeTab === 2 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                    Usage & Analytics
                  </Typography>
                  <Alert severity="info" sx={{ backgroundColor: 'rgba(74, 144, 226, 0.1)', color: '#fff', mb: 3 }}>
                    This tab would include usage statistics, analytics, and reporting tools
                  </Alert>
                </Box>
              )}

              {/* Billing Tab - Placeholder */}
              {activeTab === 3 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                    Billing Information
                  </Typography>
                  <Alert severity="info" sx={{ backgroundColor: 'rgba(74, 144, 226, 0.1)', color: '#fff', mb: 3 }}>
                    This tab would include payment methods, billing history, and invoices
                  </Alert>
                </Box>
              )}

              {/* Security Tab - Placeholder */}
              {activeTab === 4 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                    Security Settings
                  </Typography>
                  <Alert severity="info" sx={{ backgroundColor: 'rgba(74, 144, 226, 0.1)', color: '#fff', mb: 3 }}>
                    This tab would include password changes, two-factor authentication, and access controls
                  </Alert>
                </Box>
              )}
              </>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Profile Edit Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={() => !saveLoading && setProfileDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: { xs: '90%', sm: '400px' },
            maxWidth: '500px',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#fff', 
          fontFamily: "'Outfit', 'Inter', sans-serif",
          fontWeight: 600,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px',
        }}>
          Edit Profile
        </DialogTitle>
        <DialogContent sx={{ mt: 2, padding: '16px 24px' }}>
          {saveSuccess ? (
            <Alert severity="success" sx={{ backgroundColor: 'rgba(46, 174, 79, 0.1)', color: '#2eae4f', mb: 2 }}>
              Profile updated successfully!
            </Alert>
          ) : (
            <>
              <TextField
                label="Name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                InputProps={{
                  sx: {
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4a90e2',
                    },
                  }
                }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Company"
                value={editedCompany}
                onChange={(e) => setEditedCompany(e.target.value)}
                fullWidth
                margin="normal"
                variant="outlined"
                disabled={userData.isAdmin}
                helperText={userData.isAdmin ? "Admin accounts are associated with Pondemand" : ""}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                InputProps={{
                  sx: {
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#4a90e2',
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      cursor: 'not-allowed',
                    },
                  }
                }}
                FormHelperTextProps={{
                  sx: {
                    color: 'rgba(255, 255, 255, 0.5)',
                    mt: 0.5,
                    ml: 1,
                  }
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => setProfileDialogOpen(false)} 
            disabled={saveLoading}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'none',
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile} 
            disabled={saveLoading || saveSuccess}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(90deg, #4a90e2, #357ABD)',
              color: 'white',
              fontWeight: 500,
              textTransform: 'none',
              fontFamily: "'Outfit', 'Inter', sans-serif",
              '&:hover': {
                background: 'linear-gradient(90deg, #357ABD, #2A6DB0)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(74, 144, 226, 0.5)',
                color: '#fff',
              }
            }}
          >
            {saveLoading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog 
        open={activityDialogOpen} 
        onClose={() => !activityLoading && setActivityDialogOpen(false)}
        fullWidth
        maxWidth="md"
        aria-labelledby="activity-dialog-title"
        PaperProps={{
          sx: {
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        {/* Custom plain div header to completely avoid any heading elements */}
        <div
          style={{ 
            color: '#fff', 
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontWeight: 600,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div 
            id="activity-dialog-title"
            style={{ 
              fontSize: '1.25rem',
              fontWeight: 600,
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            Activity History
          </div>
          <div 
            style={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.875rem',
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            {allUserActivity.length} {allUserActivity.length === 1 ? 'item' : 'items'}
          </div>
        </div>
        <DialogContent sx={{ p: 0 }}>
          {activityLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#4a90e2' }} />
            </Box>
          ) : (
            <List sx={{ width: '100%', py: 0 }}>
              {allUserActivity.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    sx={{ 
                      px: 3, 
                      py: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {activity.type === 'audio' && (
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(74, 144, 226, 0.2)', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center' 
                        }}>
                          <Description sx={{ color: '#4a90e2', fontSize: '1.2rem' }} />
                        </Box>
                      )}
                      {activity.type === 'error' && (
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(211, 47, 47, 0.2)', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center' 
                        }}>
                          <SettingsIcon sx={{ color: '#d32f2f', fontSize: '1.2rem' }} />
                        </Box>
                      )}
                      {activity.type === 'info' && (
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center' 
                        }}>
                          <SettingsIcon sx={{ color: '#c4c4c4', fontSize: '1.2rem' }} />
                        </Box>
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography 
                            component="span"
                            sx={{ 
                              color: '#fff', 
                              fontWeight: 500,
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                            }}
                          >
                            {activity.action}
                          </Typography>
                          {activity.credits !== 0 && (
                            <Chip 
                              label={activity.credits > 0 ? `+${activity.credits}` : activity.credits} 
                              size="small"
                              sx={{ 
                                backgroundColor: activity.credits > 0 ? 'rgba(46, 174, 79, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                color: activity.credits > 0 ? '#2eae4f' : 'rgba(255, 255, 255, 0.7)',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: '24px',
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                              }}
                            />
                          )}
                        </Box>
                      } 
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography 
                            component="span"
                            sx={{ 
                              color: 'rgba(255, 255, 255, 0.5)',
                              fontSize: '0.75rem',
                              fontFamily: "'Outfit', 'Inter', sans-serif",
                            }}
                          >
                            {activity.date}
                          </Typography>
                          {activity.type === 'audio' && (
                            <Chip 
                              label="Audio" 
                              size="small"
                              sx={{ 
                                ml: 1.5,
                                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                                color: '#4a90e2',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: '20px',
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                              }}
                            />
                          )}
                          {activity.fileName && activity.type === 'audio' && (
                            <Typography 
                              component="span"
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.75rem',
                                fontFamily: "'Outfit', 'Inter', sans-serif",
                                ml: 1.5,
                              }}
                            >
                              ID: {activity.id.substring(0, 8)}...
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Button 
            onClick={() => setActivityDialogOpen(false)}
            sx={{ 
              color: '#c4c4c4',
              textTransform: 'none',
              fontFamily: "'Outfit', 'Inter', sans-serif",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage; 