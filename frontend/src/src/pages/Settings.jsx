import { useState } from "react";
import BaseLayout from "../layouts/BaseLayout";
import { AlertCircle, Bell, Globe, Lock, Moon, Shield, UserCog } from 'lucide-react';
import "../styles/theme.css";
import "../styles/pages/Settings.css";

function Settings() {
  // 设置状态
  const [settings, setSettings] = useState({
    // 应用外观
    theme: 'light',
    language: 'en',
    
    // 通知设置
    emailNotifications: true,
    reminderNotifications: true,
    achievementNotifications: true,
    
    // 数据单位
    weightUnit: 'kg',
    heightUnit: 'cm',
    energyUnit: 'kcal',
    
    // 隐私设置
    profileVisibility: 'private',
    shareProgress: false,
    
    // 目标提醒
    dailyReminder: true,
    reminderTime: '20:00',
  });

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <BaseLayout>
      <div className="page-container">
        <div className="settings-box">
          <h1>Settings</h1>

          {/* 应用外观设置 */}
          <div className="card">
            <div className="card-header">
              <h3>
                <Moon size={18} />
                <span>Appearance</span>
              </h3>
            </div>
            <div className="settings-group">
              <div className="setting-item">
                <label>Theme</label>
                <select 
                  value={settings.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="form-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Language</label>
                <select 
                  value={settings.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className="form-select"
                >
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* 单位设置 */}
          <div className="card">
            <div className="card-header">
              <h3>
                <Globe size={18} />
                <span>Units</span>
              </h3>
            </div>
            <div className="settings-group">
              <div className="setting-item">
                <label>Weight Unit</label>
                <select 
                  value={settings.weightUnit}
                  onChange={(e) => handleChange('weightUnit', e.target.value)}
                  className="form-select"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="lbs">Pounds (lbs)</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Height Unit</label>
                <select 
                  value={settings.heightUnit}
                  onChange={(e) => handleChange('heightUnit', e.target.value)}
                  className="form-select"
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="ft">Feet and Inches (ft)</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Energy Unit</label>
                <select 
                  value={settings.energyUnit}
                  onChange={(e) => handleChange('energyUnit', e.target.value)}
                  className="form-select"
                >
                  <option value="kcal">Calories (kcal)</option>
                  <option value="kj">Kilojoules (kJ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 通知设置 */}
          <div className="card">
            <div className="card-header">
              <h3>
                <Bell size={18} />
                <span>Notifications</span>
              </h3>
            </div>
            <div className="settings-group">
              <div className="setting-item">
                <label>Daily Reminder</label>
                <div className="reminder-settings">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.dailyReminder}
                      onChange={(e) => handleChange('dailyReminder', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => handleChange('reminderTime', e.target.value)}
                    disabled={!settings.dailyReminder}
                    className="form-input time-input"
                  />
                </div>
              </div>
              <div className="setting-item">
                <label>Email Notifications</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <label>Achievement Alerts</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.achievementNotifications}
                    onChange={(e) => handleChange('achievementNotifications', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 隐私设置 */}
          <div className="card">
            <div className="card-header">
              <h3>
                <Lock size={18} />
                <span>Privacy</span>
              </h3>
            </div>
            <div className="settings-group">
              <div className="setting-item">
                <label>Profile Visibility</label>
                <select 
                  value={settings.profileVisibility}
                  onChange={(e) => handleChange('profileVisibility', e.target.value)}
                  className="form-select"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Share Progress</label>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.shareProgress}
                    onChange={(e) => handleChange('shareProgress', e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* 账户安全 */}
          <div className="card danger-zone">
            <div className="card-header">
              <h3>
                <Shield size={18} />
                <span>Account Security</span>
              </h3>
            </div>
            <div className="settings-group">
              <button className="btn btn-secondary">
                Change Password
              </button>
              <button className="btn btn-danger">
                <AlertCircle size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Settings;