/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Recupera tu contraseña de PorcentajeLaboral</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>📊 PorcentajeLaboral</Text>
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Recupera tu contraseña</Heading>
        <Text style={text}>
          Recibimos una solicitud para restablecer tu contraseña en PorcentajeLaboral.
          Haz clic en el botón para elegir una nueva contraseña.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Restablecer contraseña
          </Button>
        </Section>
        <Text style={textSmall}>
          Este enlace expirará en unos minutos. Si no solicitaste este cambio,
          puedes ignorar este correo. Tu contraseña no será modificada.
        </Text>
        <Hr style={hr} />
        <Text style={footerBrand}>
          © PorcentajeLaboral — Análisis inteligente de compatibilidad laboral
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '8px' }
const logoText = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0' }
const hr = { borderColor: '#E2E8F0', margin: '20px 0' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4A5568', lineHeight: '1.6', margin: '0 0 20px' }
const textSmall = { fontSize: '13px', color: '#94A3B8', lineHeight: '1.5', margin: '0 0 20px' }
const buttonContainer = { textAlign: 'center' as const, margin: '8px 0 24px' }
const button = { backgroundColor: '#00C853', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footerBrand = { fontSize: '11px', color: '#B0BEC5', margin: '0', textAlign: 'center' as const }
