import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { userId } = useAuth();
  return (
    <header>
      {userId === undefined && (
        <nav>
          <a class="hf-link" href="/dashboard">
            <strong>Kunnátt Lite</strong>
          </a>
          <a class="hf-link" href="/login">
            Login
          </a>
          <a class="hf-link" href="/newlogin">
            Register
          </a>
          <a class="hf-link" href="/posts">
            View posts
          </a>
        </nav>
      )}
      {userId !== undefined && (
        <nav>
          <a class="hf-link" href="/dashboard">
            <strong>Kunnátt Lite</strong>
          </a>
          <div class="hf-link">ID: {userId}</div>
          <a class="hf-link" href="/posts">
            View posts
          </a>
          <a class="hf-link" href="/write">
            Write post
          </a>
          <a class="hf-link" href="/logout">
            Logout
          </a>
        </nav>
      )}
    </header>
  );
}
