from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time
import random

def run(driver, write_log):
    module = "home"
    passed, failed = 0, 0
    initial_data = {}

    # 1. 验证 home 页面加载
    try:
        WebDriverWait(driver, 10).until(EC.url_contains("/home"))
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "page-container")))
        write_log(module, "Loaded /home page successfully")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to load /home page: {e}")
        failed += 1

    # 2. 等待页面基本加载
    time.sleep(0.5)
    write_log(module, "Waited for page to load")
    passed += 1

    # 3. 测试 AI 推荐 + 饼图点击 + 推荐食物加载
    try:
        # 获取并点击 AI 推荐按钮
        ai_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "enlighten-me-btn"))
        )
        
        # 点击AI按钮
        ai_button.click()
        write_log(module, "Clicked AI recommend button")

        # 等待饼图渲染和数据加载（7秒）
        time.sleep(7)
        write_log(module, "Waited for pie chart to render")
        
        try:
            # 等待饼图容器加载
            donut_wrapper = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "donut-wrapper"))
            )
            
            # 获取所有扇区
            sectors = donut_wrapper.find_elements(By.CSS_SELECTOR, ".recharts-sector")
            
            if len(sectors) >= 3:
                # 第一个扇区是早餐
                breakfast_sector = sectors[0]
                
                # 获取扇区的中心点
                rect = breakfast_sector.rect
                center_x = rect['x'] + rect['width'] / 2
                center_y = rect['y'] + rect['height'] / 2
                
                # 创建ActionChains实例
                actions = ActionChains(driver)
                
                # 移动到扇区中心
                actions.move_to_element_with_offset(breakfast_sector, 
                    center_x - rect['x'], 
                    center_y - rect['y'])
                actions.perform()
                write_log(module, "Moved to breakfast sector center")
                
                time.sleep(1)  # 等待hover效果
                
                # 点击扇区
                actions.click()
                actions.perform()
                write_log(module, "Clicked breakfast sector")
                
                # 等待中心显示百分比（说明点击成功）
                WebDriverWait(driver, 10).until(
                    EC.text_to_be_present_in_element((By.CLASS_NAME, "donut-center-content"), "%")
                )
                write_log(module, "Percentage value appeared")

                # 验证推荐区域出现
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "recommended-food-item"))
                )
                write_log(module, "Recommended food items appeared")
                passed += 1
            else:
                write_log(module, "Not enough sectors found in pie chart")
                failed += 1
            
        except Exception as e:
            write_log(module, f"Failed to interact with breakfast sector: {e}")
            failed += 1
            
    except Exception as e:
        write_log(module, f"AI recommendation test failed: {e}")
        failed += 1

    # 4. 记录卡路里指标
    try:
        indicators = driver.find_elements(By.CLASS_NAME, "indicator")
        for indicator in indicators:
            label = indicator.find_element(By.CLASS_NAME, "indicator-label").text
            value = indicator.find_element(By.CLASS_NAME, "indicator-value").text
            initial_data[label] = value
        write_log(module, f"Recorded calorie indicators: {initial_data}")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to record calorie indicators: {e}")
        failed += 1

    # 5. 验证趋势图显示
    try:
        chart = driver.find_element(By.CLASS_NAME, "chart-container")
        if chart.is_displayed():
            write_log(module, "Weight chart is visible")
            passed += 1
        else:
            write_log(module, "Weight chart is not visible")
            failed += 1
    except Exception as e:
        write_log(module, f"Failed to check chart visibility: {e}")
        failed += 1

    # 6. 添加今日体重记录
    try:
        random_weight = round(random.uniform(50.0, 80.0), 1)

        add_weight_btn = driver.find_element(By.CLASS_NAME, "btn-icon")
        add_weight_btn.click()

        weight_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "form-input"))
        )
        weight_input.clear()
        weight_input.send_keys(str(random_weight))

        confirm_btn = driver.find_element(By.CLASS_NAME, "btn-primary")
        confirm_btn.click()

        time.sleep(2)
        write_log(module, f"Added today's weight: {random_weight}kg")
        passed += 1
    except Exception as e:
        write_log(module, f"Failed to add today's weight: {e}")
        failed += 1

    return passed, failed
