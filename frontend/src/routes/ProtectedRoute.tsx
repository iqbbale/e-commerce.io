import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../utils/store.utils";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading) return null;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
