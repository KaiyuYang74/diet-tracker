from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Set up the driver
driver = webdriver.Chrome()

try:
    # Navigate to login page
    driver.get("http://localhost:5173/login")

    # Login
    username_input = driver.find_element(By.NAME, "username")
    password_input = driver.find_element(By.NAME, "password")

    username_input.send_keys("test")
    password_input.send_keys("123456")

    login_button = driver.find_element(By.CSS_SELECTOR, "button.auth-btn[type='submit']")
    login_button.click()

    # Wait for login to complete
    WebDriverWait(driver, 10).until(EC.url_contains("/home"))
    print("Login successful!")

    token = driver.execute_script("return localStorage.getItem('token');")
    if token:
        print(f"Found authentication token: {token[:20]}...")

    # Navigate to diet page
    driver.get("http://localhost:5173/diet")
    print("Navigated to diet page")

    # Wait for page to load
    time.sleep(3)

    # Print the current page source for debugging
    page_source = driver.page_source
    print(f"Page source length: {len(page_source)}")

    # Try multiple selector strategies to find the Add Food button
    try:
        # Try by icon + text combination (looking at the image showing '+ Add Food')
        add_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Add Food')]")
        if add_buttons:
            print(f"Found {len(add_buttons)} elements containing 'Add Food' text")
            add_buttons[0].click()
            print("Clicked first 'Add Food' button")
        else:
            # Try to find the plus sign button next to the meal sections
            add_buttons = driver.find_elements(By.XPATH, "//button[contains(@class, 'add') or contains(@aria-label, 'add')]")
            if add_buttons:
                print(f"Found {len(add_buttons)} potential add buttons by class/aria-label")
                for i, button in enumerate(add_buttons):
                    print(f"Button {i}: {button.get_attribute('outerHTML')[:100]}")
                add_buttons[0].click()
                print("Clicked the first add button found")
            else:
                # Try finding all buttons and click the one that looks like an add button
                all_buttons = driver.find_elements(By.TAG_NAME, "button")
                print(f"Found {len(all_buttons)} buttons in total")
                # Look for an add button by examining each button
                for i, button in enumerate(all_buttons):
                    btn_text = button.text
                    btn_html = button.get_attribute('outerHTML')
                    if "Add" in btn_text or "+" in btn_text or "add" in btn_html.lower():
                        print(f"Found likely add button: {btn_text} - HTML: {btn_html[:100]}")
                        button.click()
                        print(f"Clicked button {i}")
                        break
    except Exception as e:
        print(f"Error trying to find Add Food button: {e}")

    # Wait for the food search page to load
    time.sleep(3)
    print("Current URL:", driver.current_url)

    # Check if we're on the food search page by looking for the search input
    try:
        search_inputs = driver.find_elements(By.XPATH, "//input[contains(@placeholder, 'Enter') or contains(@placeholder, 'Search')]")
        if search_inputs:
            print(f"Found {len(search_inputs)} search input fields")
            search_inputs[0].send_keys("chicken")
            print("Entered 'chicken' in the search box")

            # Try to find search button
            search_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Search')]")
            if search_buttons:
                search_buttons[0].click()
                print("Clicked search button")
            else:
                print("No search button found")
        else:
            print("No search input found")
    except Exception as e:
        print(f"Error during search: {e}")

    # Wait for results
    time.sleep(3)

except Exception as e:
    print(f"Test failed: {e}")
    import traceback
    traceback.print_exc()

finally:
    # Take a screenshot before closing to help with debugging
    try:
        driver.save_screenshot("test_screenshot.png")
        print("Screenshot saved as test_screenshot.png")
    except:
        print("Failed to save screenshot")

    # Pause to see the final state
    time.sleep(3)
    driver.quit()