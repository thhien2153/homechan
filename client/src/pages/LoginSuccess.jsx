import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(useLocation().search);
    const token = urlParams.get("token");

    useEffect(() => {
        if (token) {
            localStorage.setItem("token", token);
            navigate("/");
        }
    }, [token]);

    return (
        <div style={{ padding: "20px", fontSize: "18px" }}>
            🔄 Đang đăng nhập bằng Google, vui lòng đợi...
        </div>
    );
};

export default LoginSuccess;
