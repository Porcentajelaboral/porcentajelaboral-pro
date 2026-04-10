import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/privacidad?tab=terminos", { replace: true });
  }, [navigate]);
  return null;
}
