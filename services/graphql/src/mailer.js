const sgMail = require('@sendgrid/mail');
const render = require('./templates');
const {
  SENDGRID_API_KEY,
  SENDGRID_FROM,
  NOTIFICATION_TO,
  LOGO_URL,
  CONTACT_URL,
  CONTACT_TEXT,
} = require('./env');

const send = ({ to, subject, html }) => {
  const payload = {
    to,
    from: SENDGRID_FROM,
    subject,
    html,
  };

  sgMail.setApiKey(SENDGRID_API_KEY);
  const promise = sgMail.send(payload);
  promise.catch((e) => { throw e; });
  return promise;
};

const common = {
  contactUrl: CONTACT_URL,
  contactText: CONTACT_TEXT,
  logo: LOGO_URL,
};

module.exports = {
  async notify(submission = {}, { req }) {
    const subject = 'A new company update requires review';
    const html = await render('notify', { ...common, uri: `http://${req.get('host')}`, submission });
    const to = NOTIFICATION_TO;
    return send({ to, subject, html });
  },
  async thank(submission, { req }) {
    const subject = 'Your requested updates have been received';
    const html = await render('thankYou', { ...common, uri: `http://${req.get('host')}`, submission });
    const { name, email } = submission;
    const to = `${name} <${email}>`;
    return send({ to, subject, html });
  },
};
