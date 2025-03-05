import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BaseLayout from "../layouts/BaseLayout";
import "../styles/auth.css";
import "../styles/pages/Register.css";

function Register() {
    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });


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
            alert("请填写所有必填字段");
            return;
        }
        try {
            const response = await axios.post(
                "http://localhost:8080/api/auth/register",
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }
            );


            if (response.data === "Email has been taken") {
                alert("Email has been taken");

            } else if (response.data === "Username already taken!") {
                alert("Username already taken!");

            } else {
                alert(response.data);
                navigate("/set-goal");
            }
        } catch (error) {
            console.error("Register failed:", error);
            if (error.response) {
                console.error("Status code:", error.response.status);
                console.error("Return data:", error.response.data);
                alert(`Register failed: ${error.response.data}`);
            } else {
                alert("Register failed, please check the console log.");
            }
        }
    };

    return (
        <BaseLayout>
            <div className="auth-container bg-login">
                <div className="auth-box">
                    <h1>Register</h1>
                    <form className="auth-form" onSubmit={handleRegister}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Name"
                            className="auth-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            className="auth-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className="auth-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <p className="privacy-policy">
                            By signing up you agree with the{" "}
                            <a href="#">Privacy policy</a> and{" "}
                            <a href="#">Terms</a> of NutriMatrix
                        </p>
                        <button type="submit" className="auth-btn">
                            Get started
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
