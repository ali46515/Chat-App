import nodemailer from "nodemailer";
import path from "path";
import fs from "node:fs/promises";
import { AppError } from "./errorHandler";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Email service error:", error);
      } else if (success) {
        console.log("Email service ready");
      }
    });
  }

  async loadTemplate(templateName, data = {}) {
    try {
      const templatePath = path.join(
        __dirname,
        "../templates/emails",
        `${templateName}.html`,
      );
      let html = await fs.readFile(templatePath, "utf-8");

      Object.keys(data).forEach((key) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        html = html.replace(regex, data[key]);
      });

      return html;
    } catch (err) {
      console.error(`Error loading email template: ${templateName}`, err);
      throw new AppError("Error preparing email", 500);
    }
  }

  async sendEmail(options) {
    const { email, subject, template, data } = options;

    try {
      const html = await this.loadTemplate(template, data);

      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: email,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (process.env.NODE_ENV === "development") {
        console.log("Email sent:", info.messageId);
      }

      return info;
    } catch (err) {
      console.error("Error sending email:", err);
      throw new AppError("Failed to send email", 500);
    }
  }

  async sendVerificationEmail(user, verificationUrl) {
    return this.sendEmail({
      email: user.email,
      subject: "Verify your email address",
      template: "verify-email",
      data: {
        userName: user.firstName,
        verificationUrl,
        companyName: process.env.COMPANY_NAME || "ChatApp",
      },
    });
  }

  async sendPasswordResetEmail(user, resetUrl) {
    return this.sendEmail({
      email: user.email,
      subject: "Password reset request",
      template: "reset-password",
      data: {
        userName: user.firstName,
        resetUrl,
        companyName: process.env.COMPANY_NAME || "ChatApp",
      },
    });
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail({
      email: user.email,
      subject: "Welcome to ChatApp",
      template: "welcome",
      data: {
        userName: user.firstName,
        companyName: process.env.COMPANY_NAME || "ChatApp",
      },
    });
  }

  async sendPasswordChangeNotification(user) {
    return this.sendEmail({
      email: user.email,
      subject: "Your password has been changed",
      template: "password-changed",
      data: {
        userName: user.firstName,
        companyName: process.env.COMPANY_NAME || "ChatApp",
      },
    });
  }

  async sendNewDeviceNotification(user, deviceInfo) {
    return this.sendEmail({
      email: user.email,
      subject: "New device login detected",
      template: "new-device-login",
      data: {
        userName: user.firstName,
        deviceName: deviceInfo.deviceName || "Unknown Device",
        ipAddress: deviceInfo.ipAddress,
        timestamp: new Date().toLocaleString(),
        companyName: process.env.COMPANY_NAME || "ChatApp",
      },
    });
  }

  async sendAccountDeletionEmail(user) {
    return this.sendEmail({
      email: user.email,
      subject: "Your account has been deleted",
      template: "account-deleted",
      data: {
        userName: user.firstName,
        companyName: process.env.COMPANY_NAME || "ChatApp",
      },
    });
  }

  async sendBulkEmail(recipients, subject, template, data) {
    try {
      const html = await this.loadTemplate(template, data);

      const promises = recipients.map((email) =>
        this.transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
          to: email,
          subject,
          html,
        }),
      );

      return await Promise.all(promises);
    } catch (err) {
      console.error("Error sending bulk email:", err);
      throw new AppError("Failed to send bulk email", 500);
    }
  }
}

const emailService = new EmailService();

const sendEmail = (options) => emailService.sendEmail(options);

export { emailService, sendEmail };
