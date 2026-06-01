// services/emailService.js
// Envoi d'emails via Gmail (nodemailer)
// Utilisé pour : vérification email + reset mot de passe

const nodemailer = require('nodemailer')

// ── Créer le transporteur Gmail ───────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// ── Template HTML commun ──────────────────────────────────────
const emailTemplate = (title, content, buttonText, buttonUrl) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F7F9FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header orange -->
          <tr>
            <td style="background:linear-gradient(135deg,#F59E0B,#EA580C);
              padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;
                font-family:Georgia,serif;font-weight:700;">
                Lingua<span style="color:#FEF3C7;">Path</span>
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);
                font-size:14px;">Plateforme d'apprentissage des langues</p>
            </td>
          </tr>

          <!-- Contenu -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1B2A4A;font-size:22px;">
                ${title}
              </h2>
              <div style="color:#64748B;font-size:15px;line-height:1.7;">
                ${content}
              </div>

              <!-- Bouton -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${buttonUrl}"
                  style="display:inline-block;padding:14px 36px;
                  background:linear-gradient(135deg,#F59E0B,#EA580C);
                  color:#ffffff;text-decoration:none;border-radius:12px;
                  font-weight:700;font-size:15px;">
                  ${buttonText}
                </a>
              </div>

              <p style="color:#94A3B8;font-size:13px;margin-top:24px;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
                <a href="${buttonUrl}" style="color:#EA580C;word-break:break-all;">
                  ${buttonUrl}
                </a>
              </p>
              <p style="color:#CBD5E1;font-size:12px;margin-top:16px;">
                Ce lien expire dans <strong>24 heures</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:20px 40px;
              border-top:1px solid #E2E8F0;text-align:center;">
              <p style="margin:0;color:#94A3B8;font-size:12px;">
                © 2026 LinguaPath — EMSI Rabat<br/>
                Si vous n'avez pas créé de compte, ignorez cet email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ── Envoyer email de vérification ─────────────────────────────
const sendVerificationEmail = async (email, nom, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: `"LinguaPath" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '✉️ Confirmez votre adresse email — LinguaPath',
    html: emailTemplate(
      `Bonjour ${nom}, confirmez votre email`,
      `<p>Merci de vous être inscrit sur <strong>LinguaPath</strong> !</p>
       <p>Pour activer votre compte et commencer à pratiquer les langues,
       cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>`,
      'Confirmer mon email',
      url
    ),
  })
}

// ── Envoyer email de reset mot de passe ──────────────────────
const sendResetPasswordEmail = async (email, nom, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"LinguaPath" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔐 Réinitialisation de votre mot de passe — LinguaPath',
    html: emailTemplate(
      `Réinitialisation de mot de passe`,
      `<p>Bonjour <strong>${nom}</strong>,</p>
       <p>Nous avons reçu une demande de réinitialisation du mot de passe
       associé à votre compte LinguaPath.</p>
       <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
       Ce lien est valable <strong>1 heure</strong>.</p>
       <p style="color:#EF4444;font-size:13px;">
         ⚠️ Si vous n'avez pas fait cette demande, ignorez cet email.
         Votre mot de passe ne sera pas modifié.
       </p>`,
      'Réinitialiser mon mot de passe',
      url
    ),
  })
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail }