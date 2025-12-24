import React, { useState } from "react";
import axios from "axios";
import "../styles/Signup.css";

function SignUp() {
  /* ---------- 1. 상태 정의 ---------- */
  // const [form, setForm] = useState({
  //   userid: "",
  //   username: "",
  //   nickname: "",
  //   password: "",
  //   confirmPw: "",
  //   email: "",
  // });
  const [form, setForm] = useState({
    userid: "",
    username: "",
    password: "",
    confirmPw: "",
    email: "",
  });

  /* ---------- 2. 공통 onChange ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- 3. 회원가입 요청 ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 새로고침 방지

    /* 간단한 클라이언트 측 검증 */
    if (form.password !== form.confirmPw) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await axios.post("/api/auth/signup", {
        user_id: form.userid,
        name: form.username,
        password: form.password,
        email: form.email,
      });
      alert("회원가입 성공!");
      console.log(res.data);
      // 성공 시 리디렉션 또는 폼 초기화 등
    } catch (err) {
      console.error(err);
      alert("회원가입 실패: " + (err.response?.data?.message || err.message));
    }
  };
  // ID 중복 확인
  const handleCheckUserId = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:8080/api/auth/userid-signup-dup`, {
        params: { userid: form.userid },
      });
      alert(res.data.message); // ex) "사용 가능한 아이디입니다."
    } catch (err) {
      alert("이미 사용 중인 아이디입니다.");
    }
  };

  // Email 중복 확인
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:8080/api/auth/email-signup-dup`, {
        params: { email: form.email },
      });
      alert(res.data.message); // ex) "사용 가능한 이메일입니다."
    } catch (err) {
      alert("이미 사용 중인 이메일입니다.");
    }
  };
  /* ---------- 4. JSX ---------- */
  return (
    <div className="signup-screen">
      <div className="signup-box">
        <h2 className="signup-title">Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-body">
            {/* 아이디 */}
            <div className="input-group">
              <label htmlFor="userid">ID :</label>
              <input
                className="signup-input"
                type="text"
                name="userid"
                id="userid"
                value={form.userid}
                onChange={handleChange}
                required
              />
              <button className="check-btn" onClick={handleCheckUserId}>Check{"\n"}redundancy</button>
            </div>

            {/* 이름 */}
            <div className="input-group">
              <label htmlFor="username">Name :</label>
              <input
                className="signup-input"
                type="text"
                name="username"
                id="username"
                value={form.username}
                onChange={handleChange}
                required
              />
              
            </div>

            {/* 닉네임
            <div className="input-group">
              <label htmlFor="nickname">Nickname :</label>
              <input
                className="signup-input"
                type="text"
                name="nickname"
                id="nickname"
                value={form.nickname}
                onChange={handleChange}
                required
              />
            </div> */}

            {/* 비밀번호 */}
            <div className="input-group">
              <label htmlFor="password">Password :</label>
              <input
                className="signup-input"
                type="password"
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="input-group">
              <label htmlFor="confirmPw">Confirm :</label>
              <input
                className="signup-input"
                type="password"
                name="confirmPw"
                id="confirmPw"
                value={form.confirmPw}
                onChange={handleChange}
                required
              />
            </div>

            {/* 이메일 */}
            <div className="input-group">
              <label htmlFor="email">Email :</label>
              <input
                className="signup-input"
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <button className="check-btn" onClick={handleCheckEmail}>Check{"\n"}redundancy</button>
            </div>
          </div>
          

          <button className="signup-btn" type="submit">
            Sign&nbsp;Up!
          </button>
        </form>

      </div>
    </div>
  );
}

export default SignUp;
