import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./AdminTheme.css"; // Import the unified theme

/* ─── Shared style objects defined BEFORE component ─── */
const LABEL_STYLE = {
  display: "block",
  fontSize: "0.63rem",
  fontWeight: 700,
  color: "var(--dashboard-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: "0.55rem",
};

const INPUT_STYLE = {
  width: "100%",
  padding: "0.9rem 1.1rem",
  borderRadius: "10px",
  border: "1.5px solid var(--dashboard-border)",
  backgroundColor: "var(--dashboard-surface-hover)",
  fontSize: "0.875rem",
  color: "var(--dashboard-text-main)",
  outline: "none",
  fontWeight: 500,
  transition: "all 0.2s ease",
  boxSizing: "border-box",
};

/* ─── Component ─── */
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { username, password });
      const user = res.data.user;
      sessionStorage.setItem("user", JSON.stringify(user));
      
      // Route based on role
      if (user.role === 2) { // Cashier
        navigate("/pos");
      } else if (user.role === 3) { // Chef/Service
        navigate("/kds");
      } else { // Manager/Admin (role 1)
        navigate("/admin");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Tên đăng nhập hoặc mật khẩu không đúng."
      );
    } finally {
      setLoading(false);
    }
  };

  const onFocus = (e) => {
    e.target.style.borderColor = "var(--dashboard-primary)";
    e.target.style.backgroundColor = "var(--dashboard-surface)";
    e.target.style.boxShadow = "0 0 0 3px var(--dashboard-primary-light)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = "var(--dashboard-border)";
    e.target.style.backgroundColor = "var(--dashboard-surface-hover)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--dashboard-bg)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ══════════ MAIN BODY ══════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* ─── LEFT PANEL ─── */}
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            minWidth: "320px",
            display: "flex",
            flexDirection: "column",
            padding: "2rem",
            backgroundColor: "var(--dashboard-surface)",
            boxShadow: "var(--shadow-md)",
            zIndex: 10,
          }}
        >
          {/* Logo */}
          <div style={{ flexShrink: 0, paddingLeft: "1rem" }}>
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: 900,
                color: "var(--dashboard-primary)",
                letterSpacing: "-0.5px",
                fontStyle: "italic",
              }}
            >
              The Self Station
            </span>
          </div>

          {/* Form area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1rem",
            }}
          >
            <div style={{ width: "100%", maxWidth: "360px" }}>
              {/* Badge */}
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  color: "var(--dashboard-primary)",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  margin: "0 0 0.6rem 0",
                  backgroundColor: "var(--dashboard-primary-light)",
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "6px",
                }}
              >
                Admin Portal
              </p>

              {/* Heading */}
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
                  fontWeight: 900,
                  color: "var(--dashboard-text-main)",
                  lineHeight: 1.15,
                  margin: "0 0 2.5rem 0",
                  letterSpacing: "-0.5px",
                }}
              >
                Chào mừng trở lại
              </h2>

              {/* ─── FORM ─── */}
              <form
                onSubmit={handleLogin}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.4rem",
                }}
              >
                {/* Error */}
                {error && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      backgroundColor: "var(--dashboard-danger-bg)",
                      color: "var(--dashboard-danger-text)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {error}
                  </div>
                )}

                {/* Username */}
                <div>
                  <label style={LABEL_STYLE}>Email hoặc tên đăng nhập</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@theselfstation.com"
                    required
                    style={INPUT_STYLE}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>

                {/* Password */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.55rem",
                    }}
                  >
                    <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>
                      Mật khẩu
                    </label>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ ...INPUT_STYLE, letterSpacing: "0.18em" }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "1rem 1.5rem",
                    marginTop: "0.25rem",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: "var(--dashboard-primary)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.55rem",
                    transition: "all 0.2s ease",
                    boxShadow: "0 4px 6px -1px rgba(235, 105, 51, 0.2), 0 2px 4px -1px rgba(235, 105, 51, 0.1)",
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "var(--dashboard-primary-hover)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(235, 105, 51, 0.3), 0 4px 6px -2px rgba(235, 105, 51, 0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = "var(--dashboard-primary)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(235, 105, 51, 0.2), 0 2px 4px -1px rgba(235, 105, 51, 0.1)";
                    }
                  }}
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
                  {!loading && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      style={{ width: 18, height: 18 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom spacer */}
          <div style={{ flexShrink: 0, height: "2rem" }} />
        </div>

        {/* ─── RIGHT PANEL – Food Image ─── */}
        <div
          className="login-right-panel"
          style={{
            flex: 1,
            position: "relative",
            overflow: "hidden",
            backgroundColor: "var(--dashboard-bg)",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=85"
            alt="Barbecue grilled meat"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />

          {/* Overlay gradient - UI/UX Pro Max style */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, rgba(248, 250, 252, 0.8) 0%, rgba(248, 250, 252, 0) 30%, rgba(0, 0, 0, 0.4) 100%)",
            }}
          />

          {/* Quote */}
          <div
            style={{
              position: "absolute",
              bottom: "3.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              width: "78%",
              maxWidth: "400px",
              padding: "1.5rem 2rem",
              borderRadius: "16px",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center"
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "1.15rem",
                fontWeight: 700,
                fontStyle: "italic",
                lineHeight: 1.5,
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              "Nâng tầm trải nghiệm, tối ưu quản trị với Hệ thống The Self Station."
            </p>
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 767px) {
          .login-right-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Login;
