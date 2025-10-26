'use client';

import Head from 'next/head';
import Nav from '../components/Nav';
import '../styles/globals.css';
import Image from 'next/image';

import { Box, TextField, Typography, Button, Grid, Paper, Accordion, AccordionSummary, AccordionDetails, useMediaQuery, Link, Container, Divider, Card, CardContent, Avatar } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import { useState, useEffect } from 'react';
import axios from 'axios';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a1a1a',
    color: 'white',
    position: 'relative',
    fontFamily: "'Inter', 'Outfit', sans-serif"
  },
  section: {
    position: 'relative',
    zIndex: 1,
    padding: '60px 0',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heading: {
    color: 'white',
    fontWeight: '700',
    marginBottom: '24px',
    fontSize: '2.5rem',
    textAlign: 'left',
    fontFamily: "'Inter', 'Outfit', sans-serif"
  },
  subheading: {
    color: '#c4c4c4',
    fontSize: '1.25rem',
    lineHeight: 1.6,
    marginBottom: '40px',
    fontFamily: "'Inter', 'Outfit', sans-serif"
  },
  paper: {
    padding: '40px',
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(74, 144, 226, 0.2)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  featureCard: {
    height: '100%',
    padding: '32px',
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(74, 144, 226, 0.2)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    },
  },
  featureIcon: {
    color: '#4a90e2',
    fontSize: '2.5rem',
    marginBottom: '24px',
  },
  featureTitle: {
    fontWeight: '600',
    fontSize: '1.25rem',
    marginBottom: '16px',
    color: 'white',
  },
  featureDescription: {
    color: '#c4c4c4',
    lineHeight: 1.6,
  },
  inputField: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    '& .MuiInputBase-root': { 
      color: '#fff',
      borderRadius: '8px',
    },
    '& .MuiInputLabel-root': { 
      color: '#4a90e2',
      fontWeight: 'normal',
    },
    '& .MuiOutlinedInput-notchedOutline': { 
      borderColor: 'rgba(74, 144, 226, 0.3)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(74, 144, 226, 0.5)',
    },
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    textTransform: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: '#357abd',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(74, 144, 226, 0.4)',
    },
  },
  faqAccordion: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid rgba(74, 144, 226, 0.2)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    '&:before': {
      display: 'none',
    },
  },
  teamMemberCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '32px',
    border: '1px solid rgba(74, 144, 226, 0.2)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
    },
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: '16px',
    backgroundColor: '#4a90e2',
  },
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: '40px',
  },
  statItem: {
    textAlign: 'center',
    padding: '20px',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#4a90e2',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '1rem',
    color: '#c4c4c4',
    fontWeight: '500',
  },
  testimonialCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '32px',
    border: '1px solid rgba(74, 144, 226, 0.2)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    height: '100%',
  },
  testimonialQuote: {
    fontSize: '1.1rem',
    lineHeight: 1.6,
    color: '#c4c4c4',
    fontStyle: 'italic',
    marginBottom: '24px',
  },
  testimonialAuthor: {
    fontWeight: '600',
    color: 'white',
  },
  testimonialCompany: {
    color: '#c4c4c4',
    fontSize: '0.9rem',
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: '16px',
    color: 'white',
    fontWeight: '700',
  },
  sectionSubtitle: {
    textAlign: 'center',
    marginBottom: '48px',
    color: '#c4c4c4',
    maxWidth: '800px',
    margin: '0 auto 48px auto',
  },
  divider: {
    margin: '30px 0',
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
};

export default function Feedback() {
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', company: '', comments: '' });
  const [formErrors, setFormErrors] = useState({});
  const [expanded, setExpanded] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const checkSession = async (token) => {
      try {
        const response = await axios.get('https://pondemand-b26dced7fb8b.herokuapp.com/check_session', {
          headers: { 'Authorization': token }
        });
        if (response.status === 200) {
          setUserId(response.data.userid);
          setUsername(response.data.name);
          setLoggedIn(1);
        } else {
          localStorage.removeItem('sessionToken');
          setLoggedIn(0);
        }
      } catch {
        localStorage.removeItem('sessionToken');
        setLoggedIn(0);
      } finally {
        setIsLoading(false);
      }
    };
    const token = localStorage.getItem('sessionToken');
    if (token) checkSession(token);
    else setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl">Loading...</h1>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.company) errors.company = 'Company is required';
    if (!formData.comments) errors.comments = 'Message is required';
    if (Object.keys(errors).length) setFormErrors(errors);
    else {
      alert('Thank you for your message! We will get back to you shortly.');
      setFormData({ name: '', email: '', company: '', comments: '' });
      setFormErrors({});
    }
  };
  
  const handleAccordionChange = panel => (e, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const faqData = [
    { 
      question: "How does Pondemand integrate with our existing systems?", 
      answer: "Pondemand offers seamless integration with your existing content management systems, CRMs, and communication platforms through our seamless user interface and pre-built connectors. Our team provides dedicated support during the integration process to ensure a smooth transition.",
      icon: <IntegrationInstructionsIcon sx={{ fontSize: 40, color: '#4a90e2', mb: 2 }} />
    },
    { 
      question: "What security measures does Pondemand implement?", 
      answer: "We prioritize enterprise-grade security with end-to-end encryption, regular security audits, and role-based access controls. All data is stored securely in our cloud with strict access protocols.",
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#4a90e2', mb: 2 }} />
    },
    { 
      question: "Can Pondemand scale with our growing business needs?", 
      answer: "Absolutely. Our platform is designed with scalability in mind, capable of handling millions of conversations simultaneously. We offer flexible pricing that grow with your business, from startups to enterprise-level organizations.",
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#4a90e2', mb: 2 }} />
    },
    { 
      question: "What kind of analytics and reporting does Pondemand provide?", 
      answer: "Pondemand offers comprehensive analytics dashboards that provide insights into conversation engagement, user behavior, content performance, and ROI metrics. Custom reports can be generated and scheduled to align with your business reporting cycles.",
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: '#4a90e2', mb: 2 }} />
    },
    { 
      question: "How does Pondemand handle data privacy and compliance?", 
      answer: "We implement industry-standard data protection measures including encryption at rest and in transit, regular security assessments, and strict access controls. Our platform is designed to help you comply with relevant data protection regulations.",
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#4a90e2', mb: 2 }} />
    },
    { 
      question: "What kind of support does Pondemand offer?", 
      answer: "We provide dedicated support through multiple channels including email, phone, and chat. Our team of experts is available to assist with implementation, troubleshooting, and strategic guidance to ensure you get the most out of our platform.",
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: '#4a90e2', mb: 2 }} />
    }
  ];

  const features = [
    {
      icon: <AutoAwesomeIcon sx={styles.featureIcon} />,
      title: "AI-Powered Conversations",
      description: "Transform your content into tailored, context-aware dialogues that engage your audience and drive meaningful interactions."
    },
    {
      icon: <SecurityIcon sx={styles.featureIcon} />,
      title: "Enterprise Security",
      description: "Rest easy with our enterprise-grade security features, including end-to-end encryption, secured cloud data, and role-based access controls."
    },
    {
      icon: <IntegrationInstructionsIcon sx={styles.featureIcon} />,
      title: "Seamless Integration",
      description: "Connect with your existing systems through seamless user interface and pre-built connectors for a unified workflow experience."
    },
    {
      icon: <AnalyticsIcon sx={styles.featureIcon} />,
      title: "Advanced Analytics",
      description: "Gain valuable insights with comprehensive analytics dashboards that track engagement, performance, and ROI metrics."
    },
    {
      icon: <SpeedIcon sx={styles.featureIcon} />,
      title: "Scalable Performance",
      description: "Our platform scales effortlessly to handle millions of conversations simultaneously, growing with your business needs."
    },
    {
      icon: <SupportAgentIcon sx={styles.featureIcon} />,
      title: "Dedicated Support",
      description: "Access our team of experts for personalized support, onboarding assistance, and strategic guidance for your business."
    }
  ];

  const testimonials = [
    {
      quote: "Pondemand has transformed how we engage with our customers. The AI-powered conversations have increased our engagement rates by 40% and significantly improved our customer satisfaction scores.",
      author: "Sarah Johnson",
      company: "VP of Marketing, TechCorp Inc."
    },
    {
      quote: "The integration was seamless, and the analytics have given us unprecedented insights into our audience. Pondemand has become an essential part of our digital strategy.",
      author: "Michael Chen",
      company: "Director of Digital Strategy, Global Solutions"
    },
    {
      quote: "As a growing company, we needed a solution that could scale with us. Pondemand's platform has exceeded our expectations in terms of performance and flexibility.",
      author: "Emily Rodriguez",
      company: "CTO, InnovateX"
    }
  ];

  return (
    <div style={styles.container}>
      <Head>
        <title>Pondemand - Enterprise AI Conversation Platform</title>
        <meta name="description" content="Pondemand is an enterprise-grade AI conversation platform that transforms content into engaging, tailored dialogues for businesses." />
      </Head>
      <Nav isLoggedIn={loggedIn} />
      <main>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <Box sx={styles.section}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <Typography variant="h3" sx={styles.heading}>
                    Transform Content into Tailored Conversations
                  </Typography>
                  <Typography sx={styles.subheading}>
                    Pondemand's enterprise-grade AI platform helps businesses engage audiences through personalized, context-aware dialogues that drive engagement and measurable results.
                  </Typography>
                  <Button 
                    variant="contained" 
                    sx={{ 
                      ...styles.submitButton, 
                      padding: '16px 32px',
                      fontSize: '1.1rem',
                      marginTop: '16px'
                    }}
                    href="#contact"
                  >
                    Schedule a Demo
                  </Button>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
                  <Paper sx={styles.paper}>
                    <Box sx={styles.statsContainer}>
                      <Box sx={styles.statItem}>
                        <Typography sx={styles.statNumber}>40%</Typography>
                        <Typography sx={styles.statLabel}>Increase in Engagement</Typography>
                      </Box>
                      <Box sx={styles.statItem}>
                        <Typography sx={styles.statNumber}>85%</Typography>
                        <Typography sx={styles.statLabel}>Customer Satisfaction</Typography>
                      </Box>
                      <Box sx={styles.statItem}>
                        <Typography sx={styles.statNumber}>3x</Typography>
                        <Typography sx={styles.statLabel}>ROI Improvement</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={styles.divider} />

          {/* Features Section */}
          <Box sx={styles.section}>
            <Typography variant="h4" sx={styles.sectionTitle}>
              Enterprise-Grade Features
            </Typography>
            <Typography sx={styles.sectionSubtitle}>
              Our comprehensive platform provides everything you need to create, manage, and optimize AI-powered conversations at scale.
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={styles.featureCard}>
                      <CardContent>
                        {feature.icon}
                        <Typography sx={styles.featureTitle}>{feature.title}</Typography>
                        <Typography sx={styles.featureDescription}>{feature.description}</Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={styles.divider} />

          {/* FAQ Section */}
          <Box sx={styles.section}>
            <Typography variant="h4" sx={styles.sectionTitle}>
              Frequently Asked Questions
            </Typography>
            <Typography sx={styles.sectionSubtitle}>
              Find answers to common questions about our enterprise platform and services.
            </Typography>
            <Grid container spacing={4}>
              {faqData.map((faq, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Card sx={{
                      ...styles.featureCard,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {faq.icon}
                        <Typography variant="h6" sx={{ 
                          color: '#4a90e2', 
                          fontWeight: 600, 
                          ml: 2,
                          flex: 1
                        }}>
                          {faq.question}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2, borderColor: 'rgba(74, 144, 226, 0.2)' }} />
                      <Typography sx={{ color: '#c4c4c4', lineHeight: 1.6 }}>
                        {faq.answer}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography sx={{ color: '#c4c4c4', mb: 3 }}>
                Still have questions? Our team is here to help.
              </Typography>
              <Button 
                variant="contained" 
                sx={styles.submitButton}
                href="#contact"
              >
                Contact Our Team
              </Button>
            </Box>
          </Box>

          <Divider sx={styles.divider} />

          {/* Contact Section */}
          <Box id="contact" sx={styles.section}>
            <Typography variant="h4" sx={styles.sectionTitle}>
              Get in Touch
            </Typography>
            <Typography sx={styles.sectionSubtitle}>
              Ready to transform your business communication? Schedule a demo or contact our team to learn more.
            </Typography>
            <Grid container spacing={6} alignItems="stretch">
              <Grid item xs={12} md={6}>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ height: '100%' }}>
                  <Paper sx={{ ...styles.paper, height: '100%' }}>
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            label="Name"
                            name="name"
                            variant="outlined"
                            fullWidth
                            value={formData.name}
                            onChange={handleChange}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                            autoComplete="off"
                            sx={styles.inputField}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Email"
                            name="email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            value={formData.email}
                            onChange={handleChange}
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                            autoComplete="off"
                            sx={styles.inputField}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Company"
                            name="company"
                            variant="outlined"
                            fullWidth
                            value={formData.company}
                            onChange={handleChange}
                            error={!!formErrors.company}
                            helperText={formErrors.company}
                            autoComplete="off"
                            sx={styles.inputField}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Message"
                            name="comments"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.comments}
                            onChange={handleChange}
                            error={!!formErrors.comments}
                            helperText={formErrors.comments}
                            sx={styles.inputField}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" sx={styles.submitButton} fullWidth>
                            Send Message
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </Paper>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} style={{ height: '100%' }}>
                  <Paper sx={{ ...styles.paper, height: '100%' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 4, color: 'white' }}>
                      Why Choose Pondemand?
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      <Typography component="li" sx={{ mb: 3, color: '#c4c4c4' }}>
                        <strong>Enterprise-Grade Security:</strong> End-to-end encryption with regular security audits
                      </Typography>
                      <Typography component="li" sx={{ mb: 3, color: '#c4c4c4' }}>
                        <strong>Scalable Solution:</strong> Grows with your business from startup to enterprise
                      </Typography>
                      <Typography component="li" sx={{ mb: 3, color: '#c4c4c4' }}>
                        <strong>Dedicated Support:</strong> Personalized assistance from our team of experts
                      </Typography>
                      <Typography component="li" sx={{ mb: 3, color: '#c4c4c4' }}>
                        <strong>Comprehensive Analytics:</strong> Detailed insights to optimize your strategy
                      </Typography>
                      <Typography component="li" sx={{ color: '#c4c4c4' }}>
                        <strong>Seamless Integration:</strong> Connects with your existing systems and workflows
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={styles.divider} />

          {/* Team Section */}
          <Box sx={styles.section}>
            <Typography variant="h4" sx={styles.sectionTitle}>
              Meet Our Leadership
            </Typography>
            <Typography sx={styles.sectionSubtitle}>
              Our experienced team is dedicated to helping your business succeed with AI-powered conversations.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={6} md={4}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5 }}
                >
                  <Card sx={styles.teamMemberCard}>
                    <CardContent>
                      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
                        <Box 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: '50%',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <Image 
                            src="/Prathik_PFP.JPG" 
                            alt="Prathik Iyengar" 
                            fill
                            style={{ 
                              objectFit: 'cover',
                              objectPosition: 'center 30%',
                              transform: 'scale(2.4)'
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.2rem', color: 'white', mb: 1 }}>
                        Prathik Iyengar
                      </Typography>
                      <Typography sx={{ color: '#4a90e2', mb: 2 }}>Co-Founder & CTO</Typography>
                      <Typography sx={{ color: '#c4c4c4', mb: 2 }}>
                        Leading our technical vision and product development with years of experience in AI and enterprise software.
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Link href="https://www.linkedin.com/in/prathikiyengar/" target="_blank" sx={{ color: '#4a90e2', mr: 2 }}>
                          <LinkedInIcon />
                        </Link>
                        <Link href="mailto:prathik@pondemand.ai" sx={{ color: '#4a90e2' }}>
                          <BusinessIcon />
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card sx={styles.teamMemberCard}>
                    <CardContent>
                      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-start' }}>
                        <Box 
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            borderRadius: '50%',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <Image 
                            src="/Rishi_PFP.JPG" 
                            alt="Rishi Mantri" 
                            fill
                            style={{ 
                              objectFit: 'cover',
                              objectPosition: 'center 30%',
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.2rem', color: 'white', mb: 1 }}>
                        Rishi Mantri
                      </Typography>
                      <Typography sx={{ color: '#4a90e2', mb: 2 }}>Co-Founder & CEO</Typography>
                      <Typography sx={{ color: '#c4c4c4', mb: 2 }}>
                        Driving our business strategy and growth with expertise in AI commercialization and enterprise solutions.
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Link href="https://www.linkedin.com/in/rishimantri/" target="_blank" sx={{ color: '#4a90e2', mr: 2 }}>
                          <LinkedInIcon />
                        </Link>
                        <Link href="mailto:rishi@pondemand.ai" sx={{ color: '#4a90e2' }}>
                          <BusinessIcon />
                        </Link>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </main>
    </div>
  );
}
