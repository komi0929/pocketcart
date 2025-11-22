import nodemailer from "nodemailer";

function getTransport() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || "587");
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	if (!host || !user || !pass) {
		console.warn("SMTP settings are not configured. Email will be skipped.");
		return null as any;
	}
	return nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass },
	});
}

export async function sendMail(options: {
	to: string;
	subject: string;
	text: string;
	html?: string;
	fromOverride?: string;
}) {
	try {
		const transporter = getTransport();
		if (!transporter) return;
		await transporter.sendMail({
			from: options.fromOverride || process.env.NOTIFY_FROM_EMAIL || options.to,
			to: options.to,
			subject: options.subject,
			text: options.text,
			html: options.html,
		});
	} catch (e) {
		console.warn("sendMail error:", e);
	}
}



