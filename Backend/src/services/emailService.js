'use strict';
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async sendEmail({ to, subject, html, attachments = [] }) {
        try {
            // Gmail requires the 'from' address to be the same as the authenticated user for many accounts
            const fromAddress = process.env.EMAIL_USER;
            const fromName = process.env.EMAIL_FROM_NAME || 'Basha Biryani';

            const mailOptions = {
                from: `"${fromName}" <${fromAddress}>`,
                to,
                subject,
                html,
                attachments
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent: %s', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }

    async sendPasswordResetEmail(email, name, resetLink) {
        const logoUrl = 'https://bashabriyani.netlify.app/logo-min.webp';

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="padding: 30px 20px; text-align: center;">
                    <img src="${logoUrl}" alt="Basha Biryani" style="max-width: 180px; height: auto; display: block; margin: 0 auto;">
                </div>
                <div style="padding: 30px; color: #1e293b; text-align: center; border-top: 1px solid #f1f5f9;">
                    <h1 style="color: #0f172a; font-size: 22px; margin-top: 0; margin-bottom: 20px;">Password Reset Request</h1>
                    <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: left;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.6; color: #475569; text-align: left;">We received a request to reset the password for your Basha Biryani account. If you didn't make this request, you can safely ignore this email.</p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${resetLink}" style="background-color: #F2A900; color: #000000; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">Reset Your Password</a>
                    </div>
                    <p style="font-size: 14px; line-height: 1.5; color: #64748b;">This link will expire in 1 hour for your security.</p>
                </div>
                <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; color: #64748b; margin: 0;">&copy; 2024 Basha Biryani. All rights reserved.</p>
                </div>
            </div>
        `;

        return await this.sendEmail({
            to: email,
            subject: 'Reset Your Password - Basha Biryani',
            html
        });
    }
}

module.exports = new EmailService();
