// src/LoginForm.tsx
import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    /* Login */
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: pw,
      }),
      credentials: "include",
    });
    if (res.ok) {
      await refresh();
      navigate("/dashboard", { replace: true });
    } else {
      setErr("Error");
    }
  };
  const forgot = async (e: React.FormEvent) => {
    /* Request password reset */
    e.preventDefault();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/pwd_reset_request`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      },
    );
    if (res.ok) {
      await refresh();
      setForgotten(true);
    } else if (res.status === 404) {
      setErr(t("login.noemail"));
    } else {
      setErr(t("login.login_err"));
    }
  };
  const resend = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/resend_verify_code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      },
    );
    if (!res.ok) {
      setErr(t("login.login_err"));
    }
  };
  return (
    <div>
      <h1>Login</h1>
      <form className="login-form" onSubmit={submit}>
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <div />
        <label>Password</label>
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          type="password"
          placeholder="Password"
        />
        <div />
        <button
          className="btn-big"
          type="submit"
          disabled={email === "" || pw === ""}
        >
          Login
        </button>
        {err && (
          <a className="btn-big" href="/newlogin">
            Register
          </a>
        )}
      </form>
    </div>
  );
};

export const LoginFormNew = () => {
  /* Register new account */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) {
      setErr("Passwords must match");
      return;
    }
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: pw }),
      credentials: "include",
    });
    if (res.ok) {
      const res2 = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pw,
        }),
        credentials: "include",
      });
      if (res2.ok) {
        navigate("/dashboard", { replace: true });
      } else {
        setErr("Error");
      }
    } else {
      setErr("Error");
    }
  };
  return (
    <div>
      <h1>Register</h1>
      <form className="login-form" onSubmit={submit}>
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <div />
        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <div />
        <label>Password</label>
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          type="password"
          placeholder="Password"
        />
        <div />
        <label>Confirm password</label>
        <input
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          type="password"
          placeholder="Password"
        />
        <div />
        <button
          className="btn-big"
          type="submit"
          disabled={name === "" || email === "" || pw === "" || pw2 === ""}
        >
          Register
        </button>
        {err && <p className="red-err">{err}</p>}
      </form>
    </div>
  );
};

export const LogoutForm = () => {
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logout();
      navigate("/dashboard", { replace: true });
    } catch {
      setErr(t("login.logout_err"));
    }
  };
  return (
    <div>
      <h1>Logout</h1>
      <form className="login-form" onSubmit={submit}>
        <button className="btn-big" type="submit">
          Logout
        </button>
        {err && <p className="red-err">{err}</p>}
      </form>
    </div>
  );
};
