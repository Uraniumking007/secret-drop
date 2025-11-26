export const LEGAL_CONTENT = {
  privacy: `
# Privacy Policy

**Effective Date:** November 26, 2025

## 1. Introduction
Welcome to Secretdrop. We are committed to protecting your privacy and ensuring the security of your data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our secure secret-sharing platform.

## 2. Data Collection
We collect minimal data necessary to provide our services:
- **Account Information:** If you create an account, we store your email and authentication credentials.
- **Usage Data:** We log access timestamps and IP addresses for security purposes (retained for 24 hours for free users, 30 days for Pro).
- **Secrets:** Your secrets are encrypted client-side. We **cannot** decrypt or view your secrets.

## 3. Zero Knowledge Architecture
> Secretdrop is built on a "Zero Knowledge" architecture. Encryption happens in your browser before data reaches our servers. The decryption key is part of the link you share and is never stored in our database. We have no technical ability to access the contents of your drops.

## 4. Data Retention
- **Secrets:** Automatically deleted after the specified expiration time or view limit.
- **Logs:** Access logs are rotated and deleted according to your plan's retention policy.
- **Account Deletion:** You may request full account deletion at any time.

## 5. Third-Party Services
We use trusted third-party providers for specific infrastructure needs:
- **Hosting:** Netlify
- **Database:** Contabo VPS with PostgreSQL
- **Payments:** Dodo Payments

## 6. Contact Us
If you have questions about this policy, please reach us through the support form inside the Secretdrop dashboard.
`,
  terms: `
# Terms of Service

**Effective Date:** November 26, 2025

## 1. Acceptance of Terms
By accessing or using Secretdrop, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.

## 2. Acceptable Use
You agree not to use Secretdrop for any unlawful purpose, including but not limited to:
- Sharing illegal content, malware, or copyrighted material without authorization.
- Phishing or attempting to steal credentials.
- Harassing or harming others.

> We reserve the right to delete any secret or ban any user found violating these terms.

## 3. Disclaimer of Warranties
> Secretdrop is provided "as is" without warranty of any kind. We do not guarantee that the service will be uninterrupted or error-free. You are responsible for the security of the links you generate.

## 4. Limitation of Liability
To the fullest extent permitted by law, Secretdrop shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.

## 5. Changes to Terms
We may update these terms from time to time. Continued use of the service constitutes acceptance of the new terms.
`,
}
