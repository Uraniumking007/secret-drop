import nodemailer from 'nodemailer'
import { env } from '@/env'

// Create reusable transporter using Zoho SMTP
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    console.warn('SMTP not configured, email not sent:', { to, subject })
    return { success: false, error: 'SMTP not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME || 'SecretDrop'}" <${env.SMTP_FROM_EMAIL || env.SMTP_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${env.SERVER_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`
  
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

