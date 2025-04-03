# tests/test_exercise.py

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time
import random

def run(driver, write_log):
    module = "exercise"
    passed, failed = 0, 0

    try:
        driver.get("http://localhost:5173/exercise")
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "page-container"))
        )
        write_log(module, "Loaded /exercise page successfully")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to load /exercise page: {e}")
        failed += 1

    # 验证默认选择为 cardio（编号 5）
    try:
        select = Select(driver.find_element(By.TAG_NAME, "select"))
        selected = select.first_selected_option.get_attribute("value")
        if selected == "cardio":
            write_log(module, "Default selected exercise type is 'cardio'")
            passed += 1
        else:
            write_log(module, f"Expected default 'cardio', but got '{selected}'")
            failed += 1
    except Exception as e:
        write_log(module, f"Failed to validate default selected type: {e}")
        failed += 1

    # 尝试切换为 strength 并验证 header（编号 6）
    try:
        select.select_by_value("strength")
        time.sleep(1)
        headers = driver.find_elements(By.XPATH, "//h3")
        header_texts = [h.text for h in headers]
        if "Strength Training" in header_texts:
            write_log(module, "Successfully switched to 'strength' type and header appeared")
            passed += 1
        else:
            write_log(module, "'Strength Training' header not found after switching type")
            failed += 1
    except Exception as e:
        write_log(module, f"Failed to switch to 'strength' or verify header: {e}")
        failed += 1

    # 验证输入框存在（编号 2）
    try:
        name_input = driver.find_element(By.XPATH, "//input[@placeholder='Exercise Name']")
        duration_input = driver.find_element(By.XPATH, "//input[@placeholder='Duration (min)']")
        calories_input = driver.find_element(By.XPATH, "//input[@placeholder='Calories Burned']")
        write_log(module, "Found exercise input fields")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to locate input fields: {e}")
        failed += 1

    # 添加 strength 类型的记录（编号 3）
    try:
        exercise_name = f"TestStrength{random.randint(100, 999)}"
        name_input.clear()
        name_input.send_keys(exercise_name)
        duration_input.clear()
        duration_input.send_keys("10")
        calories_input.clear()
        calories_input.send_keys("50")

        driver.find_element(By.CLASS_NAME, "add-exercise-btn").click()
        write_log(module, f"Submitted new strength exercise: {exercise_name}")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to submit strength exercise: {e}")
        failed += 1

    # 验证新记录是否出现在页面（编号 4）
    try:
        time.sleep(2)
        all_exercises = driver.find_elements(By.CLASS_NAME, "exercise-item")
        found = any(exercise_name in item.text for item in all_exercises)
        if found:
            write_log(module, f"New strength exercise '{exercise_name}' found on page")
            passed += 1
        else:
            write_log(module, f"Exercise '{exercise_name}' not found on page")
            failed += 1
    except Exception as e:
        write_log(module, f"Failed to verify exercise item: {e}")
        failed += 1

    # Daily Exercise Summary 区块（编号 7）
    try:
        summary_header = driver.find_element(By.XPATH, "//h3[text()='Daily Exercise Summary']")
        write_log(module, "Found 'Daily Exercise Summary' section")
        passed += 1
    except Exception as e:
        write_log(module, f"'Daily Exercise Summary' section not found: {e}")
        failed += 1

    # Total Calories Burned + Weekly Goal（编号 8）
    try:
        data_labels = driver.find_elements(By.CLASS_NAME, "data-label")
        data_texts = [label.text for label in data_labels]
        if "Total Calories Burned" in data_texts and "Weekly Goal" in data_texts:
            write_log(module, "Found both 'Total Calories Burned' and 'Weekly Goal' labels")
            passed += 1
        else:
            write_log(module, "Missing key metrics in exercise summary section")
            failed += 1
    except Exception as e:
        write_log(module, f"Error verifying exercise summary metrics: {e}")
        failed += 1

    return passed, failed
