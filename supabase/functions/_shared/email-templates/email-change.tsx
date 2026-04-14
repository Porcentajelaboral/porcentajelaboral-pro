/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma tu cambio de email en PorcentajeLaboral</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>📊 PorcentajeLaboral</Text>
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>Confirma tu cambio de email</Heading>
        <Text style={text}>
          Solicitaste cambiar tu dirección de correo en PorcentajeLaboral de{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          a{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
        </Text>
        <Text style={text}>
          Haz clic en el botón para confirmar este cambio:
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Confirmar cambio de email
          </Button>
        </Section>
        <Text style={textSmall}>
          Si no solicitaste este cambio, protege tu cuenta de inmediato.
        </Text>
        <Hr style={hr} />
        <Text style={footerBrand}>
          © PorcentajeLaboral — Análisis inteligente de compatibilidad laboral
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '8px' }
const logoText = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0' }
const hr = { borderColor: '#E2E8F0', margin: '20px 0' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4A5568', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#00C853', textDecoration: 'underline' }
const textSmall = { fontSize: '13px', color: '#94A3B8', lineHeight: '1.5', margin: '0 0 20px' }
const buttonContainer = { textAlign: 'center' as const, margin: '8px 0 24px' }
const button = { backgroundColor: '#00C853', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footerBrand = { fontSize: '11px', color: '#B0BEC5', margin: '0', textAlign: 'center' as const }
