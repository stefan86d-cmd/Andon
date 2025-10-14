
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL;

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
    if (!process.env.RESEND_API_KEY || !fromEmail) {
        console.log("--- Mock Email (Resend not configured) ---");
        console.log(`To: ${to}`);
        console.log(`From: ${fromEmail || 'not-configured@example.com'}`);
        console.log(`Subject: ${subject}`);
        console.log("--- HTML Body ---");
        console.log(html);
        console.log("--- End Mock Email ---");
        return;
    }

    try {
        await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: subject,
            html: html,
        });
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending email with Resend:', error);
        throw new Error("Failed to send email.");
    }
}
