const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// new Email(user, url).sendWelcome();
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `alagammai lakshmanan <${process.env.EMAIL_FROM}>`;
    this.url = url;
    this.firstName = user.name.split(' ')[0];
  }
  newTransport() {
    // console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV !== 'development') {
      //use sendgrid
      // console.log('entering here');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SEND_GRID_USERNAME,
          pass: process.env.SEND_GRID_PASSWORD,
        },
      });
    }
    //here transporter for development act as mail trap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
        //in gmail activate "less secure app option"
      },
    });
  }
  //send the actual email
  async send(template, subject) {
    //1)render Html based on pug template
    // console.log(`dirname eemail js`, __dirname);
    // console.log('hello', this.firstName, this.url, subject);
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2)define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };
    //3)create a transport and send Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'welcome to natours family!');
  }
  async resetPassword() {
    await this.send('passwordReset', 'password reset token valid for 10min');
  }
};
