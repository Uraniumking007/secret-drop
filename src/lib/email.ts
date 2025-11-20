import nodemailer from 'nodemailer'
import { config } from 'dotenv'

// Load environment variables
config()

// Create reusable transporter using Zoho SMTP
// Zoho SMTP Settings (matching working configuration):
// - Host: smtp.zoho.in (India), smtp.zoho.com (US), smtp.zoho.eu (Europe)
// - Port: 465 (SSL) - recommended, or 587 (TLS)
// - Security: SSL for port 465, TLS for port 587
const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.in'
const smtpPort = parseInt(process.env.SMTP_PORT || '465')
const useSSL = smtpPort === 465
const smtpUser = process.env.SMTP_USER
const smtpPassword = process.env.SMTP_PASSWORD

// Create transporter matching working configuration
const transporterConfig = {
  host: smtpHost,
  port: smtpPort,
  secure: useSSL, // true for 465 (SSL), false for 587 (TLS)
  auth:
    smtpUser && smtpPassword
      ? {
          user: smtpUser,
          pass: smtpPassword,
        }
      : undefined,
}

const transporter = nodemailer.createTransport(transporterConfig as any)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpUser || !smtpPassword) {
    console.warn('SMTP not configured, email not sent:', { to, subject })
    console.warn('Please set SMTP_USER and SMTP_PASSWORD environment variables')
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || 'SecretDrop'
    const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser

    // Don't verify connection - just try to send
    // Verification can fail even when sending works
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)

    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message

      // Provide helpful error messages for common issues
      if (
        errorMessage.includes('535') ||
        errorMessage.includes('Authentication Failed')
      ) {
        errorMessage =
          'SMTP Authentication Failed. Please check:\n' +
          '1. Your SMTP_USER and SMTP_PASSWORD are correct\n' +
          '2. If you have 2FA enabled on Zoho, use an App Password instead of your regular password\n' +
          '3. IMAP/POP access is enabled in your Zoho Mail settings\n' +
          '4. Your Zoho account is not locked or suspended'
      } else if (errorMessage.includes('EAUTH')) {
        errorMessage =
          'SMTP Authentication Error. Please verify your credentials.'
      }
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000'
  const verificationUrl = `${serverUrl}/auth/verify-email?token=${token}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">SecretDrop</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #6b7280; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address - SecretDrop',
    html,
  })
}
