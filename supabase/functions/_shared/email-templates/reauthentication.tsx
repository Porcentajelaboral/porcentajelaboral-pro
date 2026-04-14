/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Tu código de verificación de PorcentajeLaboral</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>📊 PorcentajeLaboral</Text>
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Código de verificación</Heading>
        <Text style={text}>Usa el siguiente código para confirmar tu identidad:</Text>
        <Section style={codeContainer}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Text style={textSmall}>
          Este código expirará en breve. Si no lo solicitaste, puedes ignorar este correo.
        </Text>
        <Hr style={hr} />
        <Text style={footerBrand}>
          © PorcentajeLaboral — Análisis inteligente de compatibilidad laboral
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '8px' }
const logoText = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0' }
const hr = { borderColor: '#E2E8F0', margin: '20px 0' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4A5568', lineHeight: '1.6', margin: '0 0 20px' }
const codeContainer = { textAlign: 'center' as const, margin: '8px 0 24px' }
const codeStyle = { fontFamily: "'Space Grotesk', Courier, monospace", fontSize: '28px', fontWeight: 'bold' as const, color: '#1D3557', letterSpacing: '4px', margin: '0', backgroundColor: '#F1F5F9', padding: '12px 24px', borderRadius: '12px', display: 'inline-block' as const }
const textSmall = { fontSize: '13px', color: '#94A3B8', lineHeight: '1.5', margin: '0 0 20px' }
const footerBrand = { fontSize: '11px', color: '#B0BEC5', margin: '0', textAlign: 'center' as const }
