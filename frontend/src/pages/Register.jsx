import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../layouts/BaseLayout";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";
import "../styles/pages/Register.css";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // 处理表单提交
    const handleRegister = async (e) => {
        e.preventDefault();

        // 基本表单验证
        if (!formData.username || !formData.email || !formData.password) {
            setError("请填写所有必填字段");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const success = await register(formData);
            
            if (success) {
                navigate("/set-goal");
            } else {
                setError("注册失败，用户名或邮箱可能已存在");
            }
        } catch (error) {
            console.error("Register failed:", error);
            setError("注册失败，请稍后重试");
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseLayout>
            <div className="auth-container bg-login">
                <div className="auth-box">
                    <h1>Register</h1>
                    
                    {error && (
                      <div className="auth-error" style={{
                        color: '#d32f2f',
                        backgroundColor: '#ffebee',
                        padding: '10px',
                        borderRadius: '10px',
                        marginBottom: '15px'
                      }}>
                        {error}
                      </div>
                    )}
                    
                    <form className="auth-form" onSubmit={handleRegister}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Name"
                            className="auth-input"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="auth-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="auth-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                        />
                        <p className="privacy-policy">
                            By signing up you agree with the{" "}
                            <a href="#">Privacy policy</a> and{" "}
                            <a href="#">Terms</a> of NutriMatrix
                        </p>
                        <button 
                          type="submit" 
                          className="auth-btn"
                          disabled={loading}
                        >
                            {loading ? "注册中..." : "Get started"}
                        </button>
                    </form>
                    <p className="login-link">
                        Already have an account?{" "}
                        <span onClick={() => navigate("/login")}>Sign in</span>
                    </p>
                </div>
            </div>
        </BaseLayout>
    );
}

export default Register;