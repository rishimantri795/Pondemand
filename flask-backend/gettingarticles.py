from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time

def get_final_url(url, timeout=10):
    chrome_options = ChromeOptions()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:

    # Heroku-specific Chrome binary path
        chrome_options.binary_location = os.environ["GOOGLE_CHROME_BIN"]

        service = Service(executable_path=os.environ["CHROMEDRIVER_PATH"])

        driver = webdriver.Chrome(
            service=service,
            options=chrome_options
        )

    except Exception as e:
        print("error using os paths: ", e)

    try:
        driver.get(url)

        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.TAG_NAME, 'body'))
        )

        time.sleep(2)

        final_url = driver.current_url
        return final_url

    except Exception as e:
        print("error opening url in selenium: ", e)
        driver.quit()
    finally:
        driver.quit()