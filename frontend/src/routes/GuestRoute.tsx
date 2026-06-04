import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../utils/store.utils";

const GuestRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  if (isLoading) return null;
  if (isAuthenticated && user) {
    return (
      <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/"} replace />
    );
  }
  return <>{children}</>;
};

export default GuestRoute;
