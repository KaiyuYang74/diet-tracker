import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/theme.css";
import "../styles/pages/PasswordChange.css";

function PasswordChange() {
    const navigate = useNavigate();
    const { updatePassword } = useAuth();
    

    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);
    
    const [validations, setValidations] = useState({
        oldPassword: { valid: true, message: '' },
        newPassword: { valid: true, message: '' },
        confirmPassword: { valid: true, message: '' }
      });
    
      // 通用密码验证规则
    const validatePassword = (password) => {
        const minLength = 8;
        const hasLetter = /[A-Za-z]/;
        const hasNumber = /\d/;

        if (password.length < minLength) {
            return '密码至少需要8个字符';
        }
        if (!hasLetter.test(password)) {
            return '必须包含至少一个字母';
        }
        if (!hasNumber.test(password)) {
            return '必须包含至少一个数字';
        }
        return '';
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        // 更新表单数据
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
        // 实时验证
        switch (name) {
          case 'oldPassword':
            setValidations(prev => ({
              ...prev,
              oldPassword: {
                valid: value.length > 0,
                message: value.length > 0 ? '' : '请输入当前密码'
              }
            }));
            break;
          case 'newPassword':
            const newPwdError = validatePassword(value);
            setValidations(prev => ({
              ...prev,
              newPassword: {
                valid: !newPwdError,
                message: newPwdError
              },
              // 当修改新密码时自动验证确认密码
              confirmPassword: value !== prev.confirmPassword 
                ? { valid: false, message: '密码不一致' } 
                : prev.confirmPassword
            }));
            break;
          case 'confirmPassword':
            setValidations(prev => ({
              ...prev,
              confirmPassword: {
                valid: value === formData.newPassword,
                message: value === formData.newPassword ? '' : '密码不一致'
              }
            }));
            break;
        }
        
      };
    

    // 处理密码修改提交
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 表单验证
        if (!formData.oldPassword || !formData.newPassword) {
            setError("请填写所有必填字段");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("密码不一致");
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const success = await updatePassword({
                oldPassword:formData.oldPassword,
                newPassword:formData.newPassword
            });
            
            if (success) {
                navigate("/login", { replace: true });  // 使用replace禁止返回
                // 清空表单
                setFormData({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                setError("密码修改失败，原密码不正确");
            }
        } catch (error) {
            console.error("Password change failed:", error);
            setError("修改密码失败，请稍后重试");
        } finally {
            setLoading(false);
        }
    };

    return (
    <BaseLayout>
        <div className="page-container">
            <div className="password-change-container">
                <h2>PasswordChange</h2>
                <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Old Password</label>
                    <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    />
                    {error && <span className="error">{error}</span>}
                </div>

                <button type="submit" className="submit-btn">submit</button>
                </form>
            </div>
        </div>
    </BaseLayout>
    );
};

export default PasswordChange;