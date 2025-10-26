'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'plyr-react/plyr.css';

const Plyr = dynamic(() => import('plyr-react'), { ssr: false });

export default function PlyrPlayer({ plyrRef, source, options, style }) {
  useEffect(() => {
    // Force styles immediately when component mounts
    const applyStyles = () => {
      const plyrElement = document.querySelector('.plyr');
      if (plyrElement) {
        plyrElement.style.backgroundColor = '#2a2a2a'; // Match the site's gray background
        plyrElement.style.color = '#fff';
      }

      const plyrControls = document.querySelector('.plyr__controls');
      if (plyrControls) {
        plyrControls.style.backgroundColor = '#2a2a2a'; // Match the site's gray background
        plyrControls.style.color = '#fff';
        plyrControls.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    };

    // Initial application
    applyStyles();

    // Create an observer to handle dynamic content loading
    const observer = new MutationObserver((mutations) => {
      applyStyles();
    });

    // Start observing the document for any changes in the plyr elements
    observer.observe(document.body, { 
      childList: true,
      subtree: true 
    });

    // Run multiple times to ensure styles apply during various rendering phases
    const applyStylesTimeout = setTimeout(applyStyles, 100);
    const applyStylesTimeout2 = setTimeout(applyStyles, 500);
    const applyStylesTimeout3 = setTimeout(applyStyles, 1000);

    return () => {
      // Clean up
      observer.disconnect();
      clearTimeout(applyStylesTimeout);
      clearTimeout(applyStylesTimeout2);
      clearTimeout(applyStylesTimeout3);
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#2a2a2a', color: '#fff' }}>
      <Plyr
        ref={plyrRef}
        source={source}
        options={options}
        style={{
          ...style,
          backgroundColor: '#2a2a2a', // Match the site's gray background
          color: '#fff'
        }}
      />
    </div>
  );
}