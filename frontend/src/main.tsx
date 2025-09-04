// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard";
import { LoginForm, LoginFormNew, LogoutForm } from "./LoginForm";
import ViewPosts from "./ViewPosts";
import WritePost from "./WritePost";
import { AuthProvider } from "./AuthProvider";
import Layout from "./Layout";
import { ProtectedRoute } from "./ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/newlogin" element={<LoginFormNew />} />
            <Route path="/logout" element={<LogoutForm />} />
            <Route path="/posts" element={<ViewPosts />} />
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <WritePost />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
