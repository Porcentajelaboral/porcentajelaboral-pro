import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  plan_tipo: string | null;
  analisis_usados: number | null;
  mes_control: number | null;
  es_empresa: boolean | null;
  empresa_nombre: string | null;
  cv_en_pool: boolean | null;
  autoriza_contacto: boolean | null;
  fecha_registro: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("Perfiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  // Save pending security questions after email confirmation
  const savePendingSecurityQuestions = async (userId: string) => {
    const pending = localStorage.getItem("pending_security_questions");
    if (!pending) return;
    try {
      const questions = JSON.parse(pending);
      if (questions.user_id === userId) {
        const { error } = await supabase.from("preguntas_seguridad").insert({
          user_id: userId,
          pregunta_1: questions.pregunta_1,
          respuesta_1: questions.respuesta_1,
          pregunta_2: questions.pregunta_2,
          respuesta_2: questions.respuesta_2,
        });
        if (!error) {
          localStorage.removeItem("pending_security_questions");
        }
      }
    } catch {
      // Silently fail - questions can be set later
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        savePendingSecurityQuestions(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        savePendingSecurityQuestions(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
