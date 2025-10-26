// pages/_app.js
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {


  return (
    <>
        <Head> 
        <link rel="icon" href="/icon.ico" type="image/x-icon"/>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
        </Head>
        <Component {...pageProps} />
    </>
  
  
  );
}


export default MyApp;
