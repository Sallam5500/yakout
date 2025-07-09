import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../GlobalStyles.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === '1234') {
      navigate('/home');
    } else {
      alert('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="login-page">
      <h2 className="page-title">🔐 تسجيل الدخول</h2>
      <form onSubmit={handleLogin} className="form-section">
        <div className="form-row">
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">✅ دخول</button>
      </form>
    </div>
  );
};

export default Login;
