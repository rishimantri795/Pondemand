'use client';

import { useState } from 'react';
import { Box, TextField, Typography, Button, Grid, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import axios from 'axios';

// CSS styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(45deg, #2A2A2A, #1A1A1A)',
    color: 'white',
    fontFamily: 'Jost, sans-serif',
    position: 'relative',
  },
  section: {
    position: 'relative',
    zIndex: 1,
    padding: '30px 20px',
  },
  heading: {
    color: 'white',
    fontFamily: 'Jost, sans-serif',
    fontWeight: 'bold',
    marginBottom: '50px',  // Increased spacing between headers and content
    textAlign: 'center',
  },
  bulletList: {
    paddingLeft: '0',  // Removed padding to align with bullet points
    lineHeight: '1.8',
    listStyle: 'none',
  },
  bulletPoint: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  bulletIcon: {
    color: '#4a90e2',
    fontSize: '1.2rem',
    marginRight: '10px',
    marginTop: '4px',
  },
};

const ContactFAQPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', comments: '' });
  const [formErrors, setFormErrors] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(''); // To show status messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Modified handleSubmit to send form data to a backend endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.comments) errors.comments = 'Comments are required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Replace '/api/send-email' with  actual API endpoint
      const response = await axios.post('/api/send-email', {
        from: formData.email,
        name: formData.name,
        message: formData.comments,
        to: 'prathik@pondemand.ai'
      });
      
      if (response.status === 200) {
        setStatus('Message sent successfully!');
      } else {
        setStatus('Failed to send message. Please try again later.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('An error occurred while sending the message.');
    }
    
    // Clear form after submission
    setFormData({ name: '', email: '', comments: '' });
    setFormErrors({});
  };

  const handleAccordionChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const faqData = [
    {
      question: "How do I create a conversation?",
      answer: "To create a conversation, simply input a topic and follow the on-screen instructions. The platform will guide you step by step."
    },
    {
      question: "Can I edit my created conversations?",
      answer: "Currently, you can't directly edit conversations once they're created. However, you can always create a new conversation based on your previous work."
    },
    {
      question: "How do I access my library?",
      answer: "You can easily access your library by clicking on the 'My Library' tab in the navigation bar."
    },
    {
      question: "What if I have feedback?",
      answer: (
        <div>
          <Typography sx={{ color: '#c4c4c4', marginBottom: '20px', lineHeight: '1.6' }}>
            We greatly appreciate all feedback, as it helps us continually improve the platform. Your input plays a crucial role in helping us shape the platform.
          </Typography>
        </div>
      )
    }
  ];

  return (
    <div style={styles.container}>
      {/* About Us Section with fade-in animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Box id="about-us" sx={styles.section}>
          <Typography variant="h4" sx={styles.heading}>
            About Us
          </Typography>
          <ul style={styles.bulletList}>
            <li style={styles.bulletPoint}>
              <span style={styles.bulletIcon}>➤</span>
              <span>PodPals is an innovative on-demand audio platform designed to deliver engaging, AI-generated conversations for personalized learning.</span>
            </li>
            <li style={styles.bulletPoint}>
              <span style={styles.bulletIcon}>➤</span>
              <span>Our platform analyzes trending topics to provide users with conversations tailored to their interests.</span>
            </li>
            <li style={styles.bulletPoint}>
              <span style={styles.bulletIcon}>➤</span>
              <span>We are two college students passionate about fostering curiosity. Your feedback helps us continually improve and bring more value to our users!</span>
            </li>
          </ul>
        </Box>
      </motion.div>

      {/* Contact Section */}
      <Box id="contact" sx={styles.section}>
        <Paper>
          <Typography variant="h4" sx={styles.heading}>
            Get in Touch
          </Typography>
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
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
                  sx={{
                    backgroundColor: '#1A1A1A',
                    '& .MuiInputBase-root': { color: '#fff' },
                    '& .MuiInputLabel-root': { color: '#4a90e2', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                  }}
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
                  sx={{
                    backgroundColor: '#1A1A1A',
                    '& .MuiInputBase-root': { color: '#fff' },
                    '& .MuiInputLabel-root': { color: '#4a90e2', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                  }}
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
                  sx={{
                    backgroundColor: '#1A1A1A',
                    '& .MuiInputBase-root': { color: '#fff' },
                    '& .MuiInputLabel-root': { color: '#4a90e2', fontWeight: 'bold' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: '#1A1A1A',
                    '&:hover': { backgroundColor: '#4a90e2' },
                    width: '100%',
                    padding: '12px 0',
                    fontWeight: 'bold',
                  }}
                >
                  Submit Message
                </Button>
              </Grid>
              {status && (
                <Grid item xs={12}>
                  <Typography variant="body1" align="center" sx={{ color: 'white' }}>
                    {status}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </motion.form>
        </Paper>
      </Box>

      {/* FAQ Section */}
      <Box id="faq" sx={{ ...styles.section, paddingTop: '30px' }}>
        <Paper>
          <Typography variant="h4" sx={styles.heading}>
            Frequently Asked Questions
          </Typography>
          {faqData.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleAccordionChange(`panel${index}`)}
              sx={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #000',
                borderRadius: '8px',
                marginBottom: '15px',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#4a90e2' }} />}>
                <Typography sx={{ color: '#4a90e2', fontWeight: 'bold' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {typeof faq.answer === 'string' ? (
                  <Typography sx={{ color: '#c4c4c4' }}>{faq.answer}</Typography>
                ) : (
                  faq.answer
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Box>
    </div>
  );
};

export default ContactFAQPage;