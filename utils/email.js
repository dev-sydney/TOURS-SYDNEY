const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  /**
   *
   * @param {Object} user  recepient user
   * @param {String} url  eg. resetPasswordUrl
   * @property {String} To recepient's email address
   * @property {String} from senders's email address
   * @property {String} firstName sender's name(first)
   *
   */
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Sydney Otutey ${process.env.EMAIL_FROM}`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid
      return 1;
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }

  /**
   * this method sends the actual email to the client
   * @param {String} template The email pug template to be sent in the mail
   * @param {String} subject
   */
  async send(template, subject) {
    //1. Render the HTML based on the pug template that is passed in
    //This below kinda converts the pug template into HTML w/o rendering it
    const emailHTML = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    //2. Defining the email options
    const EmailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: emailHTML,
      text: htmlToText.htmlToText(emailHTML),
    };

    //Create a transport and send the email

    await this.newTransport().sendMail(EmailOptions); //Sending the email
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome the Syd-Tours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (only valid for 10 minutes)'
    );
  }
};
