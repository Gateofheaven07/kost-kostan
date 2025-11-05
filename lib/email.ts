import nodemailer from "nodemailer"

// Email transporter configuration
// In production, use environment variables for email credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
})

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    // If no email credentials configured, log to console (for development)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("=".repeat(60))
      console.log("📧 PASSWORD RESET EMAIL (Development Mode)")
      console.log("=".repeat(60))
      console.log(`To: ${email}`)
      console.log(`Subject: Reset Password - AKA Kost`)
      console.log(`Reset Link: ${resetLink}`)
      console.log("=".repeat(60))
      return { success: true, message: "Email logged to console (development mode)" }
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || `"AKA Kost" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Password - AKA Kost",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h1 style="color: #dc2626; margin-top: 0;">Reset Password</h1>
            <p>Halo,</p>
            <p>Kami menerima permintaan untuk mereset password akun Anda di AKA Kost.</p>
            <p>Silakan klik tombol di bawah ini untuk mereset password Anda:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p>Atau salin dan tempel link berikut di browser Anda:</p>
            <p style="word-break: break-all; color: #666; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
              ${resetLink}
            </p>
            <p><strong>Link ini akan kedaluwarsa dalam 1 jam.</strong></p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              Email ini dikirim otomatis, mohon jangan membalas email ini.
              <br>
              © ${new Date().getFullYear()} AKA Kost. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Password - AKA Kost
        
        Halo,
        
        Kami menerima permintaan untuk mereset password akun Anda di AKA Kost.
        
        Silakan klik link berikut untuk mereset password Anda:
        ${resetLink}
        
        Link ini akan kedaluwarsa dalam 1 jam.
        
        Jika Anda tidak meminta reset password, abaikan email ini.
        
        © ${new Date().getFullYear()} AKA Kost. All rights reserved.
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

