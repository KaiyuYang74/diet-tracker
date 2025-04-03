# tests/test_home_verify.py

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def run(driver, write_log):
    module = "home_verify"
    passed, failed = 0, 0
    
    # 1. 返回home页面
    try:
        driver.get("http://localhost:5173/home")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "page-container")))
        write_log(module, "Returned to /home page")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to return to /home page: {e}")
        failed += 1

    # 2. 等待数据加载
    try:
        time.sleep(1)
        write_log(module, "Waiting for data to load")
        passed += 1
    except Exception as e:
        write_log(module, f"Error during data loading: {e}")
        failed += 1

    # 3. 验证卡路里数据更新
    try:
        # 获取更新后的卡路里数据
        indicators = driver.find_elements(By.CLASS_NAME, "indicator")
        updated_data = {}
        for indicator in indicators:
            label = indicator.find_element(By.CLASS_NAME, "indicator-label").text
            value = indicator.find_element(By.CLASS_NAME, "indicator-value").text
            updated_data[label] = value
            
        # 验证数据是否合理
        if "Food" in updated_data and "Exercise" in updated_data:
            food_calories = int(updated_data["Food"])
            exercise_calories = int(updated_data["Exercise"])
            
            # 验证食物卡路里是否大于0（因为我们添加了食物）
            if food_calories > 0:
                write_log(module, f"Food calories updated: {food_calories}")
                passed += 1
            else:
                write_log(module, "Food calories not updated as expected")
                failed += 1
                
            # 验证运动卡路里是否大于0（因为我们添加了运动）
            if exercise_calories > 0:
                write_log(module, f"Exercise calories updated: {exercise_calories}")
                passed += 1
            else:
                write_log(module, "Exercise calories not updated as expected")
                failed += 1
        else:
            write_log(module, "Could not find food or exercise calories")
            failed += 1
    except Exception as e:
        write_log(module, f"Failed to verify calorie updates: {e}")
        failed += 1

    # 4. 验证体重图表更新
    try:
        chart = driver.find_element(By.CLASS_NAME, "chart-container")
        if chart.is_displayed():
            write_log(module, "Weight chart is still displayed after updates")
            passed += 1
        else:
            write_log(module, "Weight chart not visible after updates")
            failed += 1
    except Exception as e:
        write_log(module, f"Failed to verify weight chart after updates: {e}")
        failed += 1

    return passed, failed 