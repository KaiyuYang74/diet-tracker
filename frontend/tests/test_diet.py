# tests/test_diet.py

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def run(driver, write_log):
    module = "diet"
    passed, failed = 0, 0
    test_food_name = "chicken"  # 搜索关键字 & 检查添加项名称
    target_meal_section = "Lunch"  # 将添加到 Lunch 餐次

    # 1. 打开 diet 页面
    try:
        driver.get("http://localhost:5173/diet")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "page-container")))
        write_log(module, "Loaded /diet page successfully")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to load /diet page: {e}")
        failed += 1

    # 2. 查找 Add Food 按钮
    try:
        add_buttons = driver.find_elements(By.XPATH, f"//div[h3[text()='{target_meal_section}']]//button[.//span[text()='Add Food']]")
        if add_buttons:
            write_log(module, f"Found 'Add Food' button in {target_meal_section}")
            passed += 1
        else:
            write_log(module, f"No 'Add Food' button found in {target_meal_section}")
            failed += 1
    except Exception as e:
        write_log(module, f"Error locating 'Add Food' button: {e}")
        failed += 1

    # 3. 点击 Add Food 跳转到搜索页
    try:
        add_buttons[0].click()
        WebDriverWait(driver, 10).until(EC.url_contains("/food-search"))
        write_log(module, "Navigated to /food-search page")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to navigate to /food-search: {e}")
        failed += 1

    # 4. 搜索框是否存在
    try:
        search_input = driver.find_element(By.CLASS_NAME, "search-input")
        write_log(module, "Search input field found")
        passed += 1
    except Exception as e:
        write_log(module, f"Search input field not found: {e}")
        failed += 1

    # 5. 执行搜索
    try:
        search_input.clear()
        search_input.send_keys(test_food_name)
        search_btn = driver.find_element(By.CLASS_NAME, "search-btn")
        search_btn.click()
        write_log(module, f"Performed search for '{test_food_name}'")
        passed += 1
    except Exception as e:
        write_log(module, f"Search input or button failed: {e}")
        failed += 1

    # 6. 检查搜索结果并点击一个食物
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "food-item")))
        food_items = driver.find_elements(By.CLASS_NAME, "food-item")
        food_items[0].click()
        write_log(module, "Clicked on first food search result")
        passed += 1
    except Exception as e:
        write_log(module, f"Error selecting food item: {e}")
        failed += 1

    # 7. 点击 "Add to Diary" 按钮并跳回 diet 页面
    try:
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CLASS_NAME, "add-btn")))
        driver.find_element(By.CLASS_NAME, "add-btn").click()

        WebDriverWait(driver, 10).until(EC.url_contains("/diet"))
        write_log(module, "Returned to /diet page after adding food")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to add food or return to /diet: {e}")
        failed += 1

    # 8. 检查食物是否出现在 lunch 栏目
    try:
        WebDriverWait(driver, 10).until(EC.presence_of_element_located(
            (By.XPATH, f"//div[h3[text()='{target_meal_section}']]/following-sibling::div//div[contains(@class, 'food-name') and contains(text(), '{test_food_name}')]")
        ))
        write_log(module, f"Confirmed '{test_food_name}' appears under {target_meal_section}")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to find added food in {target_meal_section}: {e}")
        failed += 1

    return passed, failed
