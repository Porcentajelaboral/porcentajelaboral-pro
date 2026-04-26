import { useSearchParams } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";

/**
 * Returns the preview_plan query param ONLY when the current user is admin.
 * For non-admin users this always returns null, so plan gating cannot be bypassed.
 */
export function usePreviewPlan() {
  const [searchParams] = useSearchParams();
  const { isAdmin, loading } = useAdmin();
  const raw = searchParams.get("preview_plan");
  const previewPlan = !loading && isAdmin ? raw : null;
  return { previewPlan, isAdmin, loading };
}
