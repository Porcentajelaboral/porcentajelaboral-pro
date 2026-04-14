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

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Confirma tu email en PorcentajeLaboral</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logoText}>📊 PorcentajeLaboral</Text>
        </Section>
        <Hr style={hr} />
        <Heading style={h1}>¡Bienvenido/a! Confirma tu email</Heading>
        <Text style={text}>
          Gracias por registrarte en{' '}
          <Link href={siteUrl} style={link}>
            <strong>PorcentajeLaboral</strong>
          </Link>
          . Estás a un paso de descubrir tu porcentaje de compatibilidad laboral.
        </Text>
        <Text style={text}>
          Confirma tu dirección de correo (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) haciendo clic en el botón:
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={confirmationUrl}>
            Confirmar mi cuenta
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Si no creaste una cuenta en PorcentajeLaboral, puedes ignorar este correo.
        </Text>
        <Text style={footerBrand}>
          © PorcentajeLaboral — Análisis inteligente de compatibilidad laboral
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Space Grotesk', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const header = { textAlign: 'center' as const, marginBottom: '8px' }
const logoText = { fontSize: '20px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0' }
const hr = { borderColor: '#E2E8F0', margin: '20px 0' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#1D3557', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#4A5568', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#00C853', textDecoration: 'underline' }
const buttonContainer = { textAlign: 'center' as const, margin: '8px 0 24px' }
const button = { backgroundColor: '#00C853', color: '#ffffff', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '12px', padding: '14px 28px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#94A3B8', margin: '0 0 8px' }
const footerBrand = { fontSize: '11px', color: '#B0BEC5', margin: '0', textAlign: 'center' as const }
