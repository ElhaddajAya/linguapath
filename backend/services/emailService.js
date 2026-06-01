// Service d'envoi d'email — utilise Resend (https://resend.com/)
const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

// ── Template HTML commun ──────────────────────────────────────
const emailTemplate = (title, content, buttonText, buttonUrl) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F7F9FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#F59E0B,#EA580C);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:28px;font-family:Georgia,serif;font-weight:700;">
              Lingua<span style="color:#FEF3C7;">Path</span>
            </h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
              Plateforme d'apprentissage des langues
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#1B2A4A;font-size:22px;">${title}</h2>
            <div style="color:#64748B;font-size:15px;line-height:1.7;">${content}</div>
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
              Si le bouton ne fonctionne pas, copiez ce lien :<br/>
              <a href="${buttonUrl}" style="color:#EA580C;word-break:break-all;">${buttonUrl}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#F8FAFC;padding:20px 40px;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">
              © 2026 LinguaPath — EMSI Rabat<br/>
              Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

// ── Envoyer email de vérification ─────────────────────────────
const sendVerificationEmail = async (email, nom, token) =>
{
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  await resend.emails.send({
    from: 'LinguaPath <onboarding@resend.dev>',
    to: email,
    subject: '✉️ Confirmez votre adresse email — LinguaPath',
    html: emailTemplate(
      `Bonjour ${nom}, confirmez votre email`,
      `<p>Merci de vous être inscrit sur <strong>LinguaPath</strong> !</p>
       <p>Cliquez ci-dessous pour confirmer votre email.</p>`,
      'Confirmer mon email', url
    ),
  })
}

// ── Envoyer email de reset mot de passe ──────────────────────
const sendResetPasswordEmail = async (email, nom, token) =>
{
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  await resend.emails.send({
    from: 'LinguaPath <onboarding@resend.dev>',
    to: email,
    subject: '🔐 Réinitialisation de votre mot de passe — LinguaPath',
    html: emailTemplate(
      'Réinitialisation de mot de passe',
      `<p>Bonjour <strong>${nom}</strong>,</p>
       <p>Cliquez ci-dessous pour réinitialiser votre mot de passe.</p>`,
      'Réinitialiser mon mot de passe', url
    ),
  })
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail }