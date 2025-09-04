import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "./AuthProvider";

export default function Dashboard() {
  const { userId, name } = useAuth();
  return (
    <div>
      <h1>Kunnátt Lite</h1>
      <p>
        This is my test project for Energex AI, presented as a lite version of
        my app Kunnátt. - Nathan HK
      </p>
      {userId ? <p>Logged in as: {name}</p> : <p>Not logged in</p>}
      {userId ? (
        <ul>
          <li>
            <a href="/posts">View posts</a>
          </li>
          <li>
            <a href="/write">Write post</a>
          </li>
          <li>
            <a href="/logout">Logout</a>
          </li>
        </ul>
      ) : (
        <ul>
          <li>
            <a href="/posts">View posts</a>
          </li>
          <li>
            <a href="/login">Login</a>
          </li>
          <li>
            <a href="/newlogin">Register</a>
          </li>
        </ul>
      )}
    </div>
  );
}
