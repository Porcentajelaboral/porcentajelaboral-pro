export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analisis: {
        Row: {
          brechas: string | null
          cv_texto: string | null
          fecha: string | null
          fuente_oferta: string | null
          habilidades_match: string | null
          id: string
          keywords_faltan: string | null
          nivel: string | null
          oferta_empresa: string | null
          oferta_modalidad: string | null
          oferta_salario: string | null
          oferta_texto: string | null
          oferta_titulo: string | null
          oferta_ubicacion: string | null
          oferta_url: string | null
          plan_mejora_cv: string | null
          porcentaje: number | null
          preguntas_entrev: string | null
          recomendaciones: string | null
          resumen_ejecutivo: string | null
          user_id: string
          visible_pool: boolean | null
        }
        Insert: {
          brechas?: string | null
          cv_texto?: string | null
          fecha?: string | null
          fuente_oferta?: string | null
          habilidades_match?: string | null
          id?: string
          keywords_faltan?: string | null
          nivel?: string | null
          oferta_empresa?: string | null
          oferta_modalidad?: string | null
          oferta_salario?: string | null
          oferta_texto?: string | null
          oferta_titulo?: string | null
          oferta_ubicacion?: string | null
          oferta_url?: string | null
          plan_mejora_cv?: string | null
          porcentaje?: number | null
          preguntas_entrev?: string | null
          recomendaciones?: string | null
          resumen_ejecutivo?: string | null
          user_id?: string
          visible_pool?: boolean | null
        }
        Update: {
          brechas?: string | null
          cv_texto?: string | null
          fecha?: string | null
          fuente_oferta?: string | null
          habilidades_match?: string | null
          id?: string
          keywords_faltan?: string | null
          nivel?: string | null
          oferta_empresa?: string | null
          oferta_modalidad?: string | null
          oferta_salario?: string | null
          oferta_texto?: string | null
          oferta_titulo?: string | null
          oferta_ubicacion?: string | null
          oferta_url?: string | null
          plan_mejora_cv?: string | null
          porcentaje?: number | null
          preguntas_entrev?: string | null
          recomendaciones?: string | null
          resumen_ejecutivo?: string | null
          user_id?: string
          visible_pool?: boolean | null
        }
        Relationships: []
      }
      match_candidatos: {
        Row: {
          candidato_acepta: boolean | null
          candidato_id: string | null
          empresa_contacto: boolean | null
          fecha_match: string | null
          id: string
          oferta_id: string
          porcentaje_match: number | null
          resumen_ia: string | null
        }
        Insert: {
          candidato_acepta?: boolean | null
          candidato_id?: string | null
          empresa_contacto?: boolean | null
          fecha_match?: string | null
          id?: string
          oferta_id: string
          porcentaje_match?: number | null
          resumen_ia?: string | null
        }
        Update: {
          candidato_acepta?: boolean | null
          candidato_id?: string | null
          empresa_contacto?: boolean | null
          fecha_match?: string | null
          id?: string
          oferta_id?: string
          porcentaje_match?: number | null
          resumen_ia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_candidatos_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas_laborales"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas_laborales: {
        Row: {
          activa: boolean | null
          descripcion: string | null
          empresa_id: string
          fecha_publicacion: string | null
          id: string
          requisitos: string | null
          titulo: string | null
          total_candidatos: number | null
        }
        Insert: {
          activa?: boolean | null
          descripcion?: string | null
          empresa_id?: string
          fecha_publicacion?: string | null
          id?: string
          requisitos?: string | null
          titulo?: string | null
          total_candidatos?: number | null
        }
        Update: {
          activa?: boolean | null
          descripcion?: string | null
          empresa_id?: string
          fecha_publicacion?: string | null
          id?: string
          requisitos?: string | null
          titulo?: string | null
          total_candidatos?: number | null
        }
        Relationships: []
      }
      Perfiles: {
        Row: {
          acepta_privacidad: boolean | null
          acepta_terminos: boolean | null
          analisis_usados: number | null
          autoriza_contacto: boolean | null
          cv_en_pool: boolean | null
          email: string | null
          empresa_nombre: string | null
          empresa_rut: string | null
          es_empresa: boolean | null
          fecha_registro: string | null
          id: string
          mes_control: number | null
          nombre: string | null
          plan_tipo: string | null
          ultima_actualizacion_password: string | null
          user_id: string
        }
        Insert: {
          acepta_privacidad?: boolean | null
          acepta_terminos?: boolean | null
          analisis_usados?: number | null
          autoriza_contacto?: boolean | null
          cv_en_pool?: boolean | null
          email?: string | null
          empresa_nombre?: string | null
          empresa_rut?: string | null
          es_empresa?: boolean | null
          fecha_registro?: string | null
          id?: string
          mes_control?: number | null
          nombre?: string | null
          plan_tipo?: string | null
          ultima_actualizacion_password?: string | null
          user_id?: string
        }
        Update: {
          acepta_privacidad?: boolean | null
          acepta_terminos?: boolean | null
          analisis_usados?: number | null
          autoriza_contacto?: boolean | null
          cv_en_pool?: boolean | null
          email?: string | null
          empresa_nombre?: string | null
          empresa_rut?: string | null
          es_empresa?: boolean | null
          fecha_registro?: string | null
          id?: string
          mes_control?: number | null
          nombre?: string | null
          plan_tipo?: string | null
          ultima_actualizacion_password?: string | null
          user_id?: string
        }
        Relationships: []
      }
      preguntas_seguridad: {
        Row: {
          created_at: string
          id: string
          pregunta_1: string
          pregunta_2: string
          respuesta_1: string
          respuesta_2: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pregunta_1: string
          pregunta_2: string
          respuesta_1: string
          respuesta_2: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pregunta_1?: string
          pregunta_2?: string
          respuesta_1?: string
          respuesta_2?: string
          user_id?: string
        }
        Relationships: []
      }
      suscripciones: {
        Row: {
          activa: boolean | null
          fecha_inicio: string | null
          fecha_renovacion: string | null
          flow_id: string | null
          id: string
          monto_clp: number | null
          plan: string | null
          user_id: string
        }
        Insert: {
          activa?: boolean | null
          fecha_inicio?: string | null
          fecha_renovacion?: string | null
          flow_id?: string | null
          id?: string
          monto_clp?: number | null
          plan?: string | null
          user_id?: string
        }
        Update: {
          activa?: boolean | null
          fecha_inicio?: string | null
          fecha_renovacion?: string | null
          flow_id?: string | null
          id?: string
          monto_clp?: number | null
          plan?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
