// Service d'envoi d'email — utilise Resend (https://resend.com/)
// Deux fonctions : sendVerificationEmail() et sendResetPasswordEmail()
// Appelées depuis authController.js lors de l'inscription et de la demande de réinitialisation

const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

const sendVerificationEmail = async (email, nom, token) =>
{
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  await resend.emails.send({
    from: 'LinguaPath <onboarding@resend.dev>',
    to: email,
    subject: '✉️ Confirmez votre adresse email — LinguaPath',
    html: emailTemplate(`Bonjour ${nom}, confirmez votre email`,
      `<p>Merci de vous être inscrit sur <strong>LinguaPath</strong> !</p>
       <p>Cliquez ci-dessous pour confirmer votre email.</p>`,
      'Confirmer mon email', url),
  })
}

const sendResetPasswordEmail = async (email, nom, token) =>
{
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
  await resend.emails.send({
    from: 'LinguaPath <onboarding@resend.dev>',
    to: email,
    subject: '🔐 Réinitialisation de votre mot de passe — LinguaPath',
    html: emailTemplate('Réinitialisation de mot de passe',
      `<p>Bonjour <strong>${nom}</strong>,</p>
       <p>Cliquez ci-dessous pour réinitialiser votre mot de passe.</p>`,
      'Réinitialiser mon mot de passe', url),
  })
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail }