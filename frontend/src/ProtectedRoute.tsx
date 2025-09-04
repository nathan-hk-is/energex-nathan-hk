// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import React from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { userId, loading } = useAuth();
  if (loading) return <p>Hleður...</p>; // or a spinner component
  if (userId === undefined) return <Navigate to="/login" replace />;
  return children;
};
