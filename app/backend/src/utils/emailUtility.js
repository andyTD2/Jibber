const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SECRETS.EMAIL_ACCOUNT,
    pass: SECRETS.EMAIL_APP_PASSWORD 
  },
});

/*
    Send to email.

    mailOptions (obj): Contains the content of the message, as well as other options. Example:
    {
        from: sender,
        to: recipient,
        subject: 'Title of the email',
        text: `Content of the email body`,
    }
*/
const sendEmail = async function(mailOptions)
{
    transporter.sendMail(mailOptions, (error, info) => 
    {
        if (error) 
        {
            console.log('Error: ', error);
        }
    });

    return;
}

/*
    Sends an account verification email to a user.

    sender (str, required): The email sender
    recipient (str, required): The recipient of the email
    verificationCode (str, required): The verification code for the user.
*/
const sendVerificationEmail = async function(sender, recipient, verificationCode)
{
    const verificationMailOptions = {
        from: sender,
        to: recipient, // Recipient's email address
        subject: 'Account Verification',
        text: `
                Hello,

                In order to complete registration, please verify your account using the following code: ${verificationCode}

                This code will expire in 20 minutes.
                If you didn't request this code, please ignore this message.`,
      };

    sendEmail(verificationMailOptions);
    return;
}

/*
    Sends an password reset verification email to a user.

    sender (str, required): The email sender
    recipient (str, required): The recipient of the email
    verificationCode (str, required): The verification code for the user.
*/
const sendPasswordResetEmail = async function(sender, recipient, verificationCode)
{
    const verificationMailOptions = {
        from: sender,
        to: recipient, // Recipient's email address
        subject: 'Password Reset',
        text: `
                Hello,

                In order to reset your password, please use following code: ${verificationCode}

                This code will expire in 20 minutes. 
                If you didn't request this code, please ignore this message.`,
      };

    sendEmail(verificationMailOptions);
    return;
}

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
}