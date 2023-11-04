import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { email, subject, template, data } = options;

  // Get the directory path of the current module using import.meta.url
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  console.log('templatePath',path.join(__dirname, '../mails', template));

  const templatePath = path.join(__dirname, '../mails', template); // Do not append .ejs extension

  try {
    // Read the EJS template file
    console.log('enter heree');
    const templateFile = await ejs.renderFile(templatePath, data);

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      html: templateFile, // Use the loaded template content
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
    throw new Error(`Error loading or sending the email: ${error.message}`);
  }
};

export default sendMail;
