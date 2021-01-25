const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const handlebars = require('handlebars');
const { SENDGRID_API_KEY } = require('../../config/default.json');
sgMail.setApiKey(SENDGRID_API_KEY);


async function sendMail(receiver, content) {
    const msg = {
      //extract the email details
      to: receiver.to,
      from: 'nimish.paranjape.rebase@gmail.com',
      cc: receiver.cc,
      //extract the custom fields 
      dynamic_template_data: {
        ...content.values
     }
    };
    switch(content.type) {
      case 'SENDGRID_TEMPLATE':
        msg.template_id = content.body;
        break;
      case 'HTML':
        msg.subject = 'Tackll marketing template';
        msg.html = fs.readFileSync('public/templates/index.html', 'utf-8');
        break;
      case 'DYNAMIC_HTML':
        const source = fs.readFileSync('public/templates/dynamic_index.hbs', 'utf-8');
        const template = handlebars.compile(source)(content.values);
        msg.subject = 'Tackll marketing template';
        msg.html = template;
        break;
    }
    //send the email
    console.log(msg);
    try {
      const response = await sgMail.send(msg);
      return response;
    }
    catch(err) {
      // console.log('ERR - ', err.response.body.errors);
      return err;
    }
  }

  module.exports = sendMail;