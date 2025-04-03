# tests/utils/driver_setup.py

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def get_driver():
    driver = webdriver.Chrome()
    driver.maximize_window()
    return driver

def write_log(module: str, message: str):
    with open("test_output.txt", "a", encoding="utf-8") as f:
        f.write(f"[{module}] {message}\n")

def login(driver, username="test", password="123456"):
    try:
        driver.get("http://localhost:5173/login")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username")))

        driver.find_element(By.NAME, "username").send_keys(username)
        driver.find_element(By.NAME, "password").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "button.auth-btn[type='submit']").click()

        WebDriverWait(driver, 10).until(EC.url_contains("/home"))
        write_log("login", "Login successful")
        return True
    except Exception as e:
        write_log("login", f"Login failed: {e}")
        return False
