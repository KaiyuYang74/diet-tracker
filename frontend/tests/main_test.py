# tests/main_test.py

from utils.driver_setup import get_driver, login, write_log
import test_home
import test_diet
import test_exercise
import test_profile
import test_home_verify

TEST_MODULES = [
    ("home", test_home),
    ("diet", test_diet),
    ("exercise", test_exercise),
    ("home_verify", test_home_verify),
    ("profile", test_profile)
]

def run_all_tests():
    driver = get_driver()
    total_tests = 0
    total_passed = 0
    total_failed = 0

    try:
        # 清空旧日志
        open("test_output.txt", "w").close()

        if not login(driver):
            print("Login failed. Testing aborted.")
            return

        for name, module in TEST_MODULES:
            passed, failed = module.run(driver, write_log)
            current_total = passed + failed
            total_tests += current_total
            total_passed += passed
            total_failed += failed
            print(f"[{name}] {current_total} tests run: {passed} passed, {failed} failed")

    finally:
        driver.quit()
        print(f"\nTotal tests: {total_tests} | Passed: {total_passed} | Failed: {total_failed}")

if __name__ == "__main__":
    run_all_tests()
