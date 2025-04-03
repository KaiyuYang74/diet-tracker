# tests/test_profile.py

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random

def run(driver, write_log):
    module = "profile"
    passed, failed = 0, 0

    # 1. 点击头像 → Profile
    try:
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, "user-avatar"))).click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Profile')]"))).click()
        WebDriverWait(driver, 10).until(EC.url_contains("/profile"))
        write_log(module, "Navigated to /profile via avatar menu")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to navigate to profile page: {e}")
        failed += 1

    # 2. 检查关键字段
    try:
        height_input = driver.find_element(By.NAME, "height")
        weight_input = driver.find_element(By.NAME, "currentWeight")
        target_weight_input = driver.find_element(By.NAME, "targetWeight")
        goal_buttons = driver.find_elements(By.CLASS_NAME, "goal-btn")
        write_log(module, "Found height, currentWeight, targetWeight, and goal buttons")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to locate profile input fields: {e}")
        failed += 1

    # 3. 修改数据并保存（不包含 DOB）
    try:
        new_height = str(random.randint(160, 180))
        new_weight = str(random.randint(55, 80))
        new_target_weight = str(random.randint(50, 75))

        height_input.clear()
        height_input.send_keys(new_height)
        weight_input.clear()
        weight_input.send_keys(new_weight)
        target_weight_input.clear()
        target_weight_input.send_keys(new_target_weight)

        goal_buttons[0].click()

        driver.find_element(By.XPATH, "//button[contains(text(), 'Save Changes')]").click()

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "success-message"))
        )
        write_log(module, "Successfully saved profile without DOB")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to modify and save profile: {e}")
        failed += 1

    # 4. 点击 Logo 返回首页
    try:
        driver.find_element(By.CLASS_NAME, "logo").click()
        WebDriverWait(driver, 10).until(EC.url_contains("/home"))
        write_log(module, "Returned to /home by clicking logo")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to return to /home via logo: {e}")
        failed += 1

    # 5. 再次进入 profile 验证保存值（不含 DOB）
    try:
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, "user-avatar"))).click()
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Profile')]"))).click()
        WebDriverWait(driver, 10).until(EC.url_contains("/profile"))
        time.sleep(2)

        curr_height = driver.find_element(By.NAME, "height").get_attribute("value")
        curr_weight = driver.find_element(By.NAME, "currentWeight").get_attribute("value")
        curr_target = driver.find_element(By.NAME, "targetWeight").get_attribute("value")

        if curr_height == new_height and curr_weight == new_weight and curr_target == new_target_weight:
            write_log(module, "Verified height, weight, targetWeight persisted after reload")
            passed += 1
        else:
            write_log(module, f"Data mismatch: h={curr_height}, w={curr_weight}, tw={curr_target}")
            failed += 1
    except Exception as e:
        write_log(module, f"Failed to re-verify saved profile: {e}")
        failed += 1

    return passed, failed
