import { useAuth } from "@/contexts/AuthContext";

const ADMIN_EMAIL = "contacto@porcentajelaboral.com";

export function useAdmin() {
  const { user, loading } = useAuth();
  const isAdmin = !loading && user?.email === ADMIN_EMAIL;
  return { isAdmin, loading };
}
