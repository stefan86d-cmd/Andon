
import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

if (apiKey) {
    sgMail.setApiKey(apiKey);
} else {
    console.warn("SENDGRID_API_KEY is not set. Emails will be logged to the console instead of being sent.");
}

interface EmailPayload {
    to: string;
    subject: string;
    text?: string;
    html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailPayload) {
    if (!apiKey || !fromEmail) {
        console.log("--- Mock Email ---");
        console.log(`To: ${to}`);
        console.log(`From: ${fromEmail || 'not-configured@example.com'}`);
        console.log(`Subject: ${subject}`);
        console.log("--- HTML Body ---");
        console.log(html);
        console.log("--- End Mock Email ---");
        return;
    }

    const msg = {
        to,
        from: fromEmail,
        subject,
        text: text || 'This is a fallback text content for the email.',
        html,
    };

    try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);

        if ((error as any).response) {
            console.error((error as any).response.body)
        }
        
        throw new Error("Failed to send email.");
    }
}
