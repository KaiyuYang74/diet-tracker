/**
 * 日期处理工具函数
 * 简化日期处理
 */

/**
 * 计算年龄
 * @param {string} birthDate - 生日日期，YYYY-MM-DD字符串
 * @returns {number} - 年龄
 */
export function calculateAge(birthDate) {
    if (!birthDate) return null;
    
    const today = new Date();
    const [birthYear, birthMonth, birthDay] = birthDate.split('-').map(Number);
    let age = today.getFullYear() - birthYear;
    
    const monthDiff = today.getMonth() + 1 - birthMonth;
    const dayDiff = today.getDate() - birthDay;
    
    // 如果今年的生日还没过，减去1岁
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    return age;
  }
  
  /**
   * 格式化日期为显示格式
   * @param {string} date - 日期字符串，YYYY-MM-DD
   * @returns {string} - 格式化的日期字符串，如"Jan 1, 2000"
   */
  export function formatDateForDisplay(date) {
    if (!date) return "";
    
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }