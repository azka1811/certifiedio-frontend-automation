const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

function readJsonReport() {
  const reportPath = path.resolve(__dirname, '..', 'report', 'results.json');
  if (!fs.existsSync(reportPath)) {
    return null;
  }
  const raw = fs.readFileSync(reportPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function buildSummary(json) {
  if (!json) {
    return {
      subject: 'Playwright Report: No results.json found',
      html: '<p>No JSON results found. Did the tests run?</p>',
    };
  }

  const stats = json?.stats || {};
  const passed = stats?.expected || 0;
  const failed = (stats?.unexpected || 0) + (stats?.flaky || 0);
  const skipped = stats?.skipped || 0;
  const total = passed + failed + skipped;

  const subject = `Playwright Report: ${passed}/${total} passed, ${failed} failed`;
  const html = `
    <h3>Daily Playwright Test Report</h3>
    <ul>
      <li><strong>Total:</strong> ${total}</li>
      <li><strong>Passed:</strong> ${passed}</li>
      <li><strong>Failed:</strong> ${failed}</li>
      <li><strong>Skipped:</strong> ${skipped}</li>
    </ul>
    <p>HTML report is attached if available.</p>
  `;
  return { subject, html };
}

async function main() {
  const {
    SMTP_HOST,
    SMTP_PORT = '587',
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
    MAIL_TO,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !MAIL_FROM || !MAIL_TO) {
    console.error('Missing SMTP or mail env vars.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const json = readJsonReport();
  const summary = buildSummary(json);

  const mailOptions = {
    from: MAIL_FROM,
    to: MAIL_TO.split(',').map(s => s.trim()),
    subject: summary.subject,
    html: summary.html,
  };

  await transporter.sendMail(mailOptions);
  console.log('Report email sent');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


