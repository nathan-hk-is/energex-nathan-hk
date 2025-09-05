import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { userId } = useAuth();
  return (
    <header>
      {userId === undefined && (
        <nav>
          <a className="hf-link" href="/dashboard">
            <strong>Kunnátt Lite</strong>
          </a>
          <a className="hf-link" href="/login">
            Login
          </a>
          <a className="hf-link" href="/newlogin">
            Register
          </a>
          <a className="hf-link" href="/posts">
            View posts
          </a>
        </nav>
      )}
      {userId !== undefined && (
        <nav>
          <a className="hf-link" href="/dashboard">
            <strong>Kunnátt Lite</strong>
          </a>
          <div className="hf-link">ID: {userId}</div>
          <a className="hf-link" href="/posts">
            View posts
          </a>
          <a className="hf-link" href="/write">
            Write post
          </a>
          <a className="hf-link" href="/logout">
            Logout
          </a>
        </nav>
      )}
    </header>
  );
}
