const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const handlebars = require('handlebars');

async function sendEmail(input) {
    const msg = {
      //extract the email details
      to: input.receiver.to,
      from: input.sender.email,
      cc: input.receiver.cc,
      //extract the custom fields 
      dynamic_template_data: {
        ...input.content.values
     }
    };
    switch(input.content.type) {
      case 'TEMPLATE':
        msg.template_id = input.content.templateId;
        break;
      case 'HTML':
        msg.subject = input.content.subject;
        msg.html = fs.readFileSync(input.content.html, 'utf-8');
        break;
      case 'DYNAMIC_HTML':
        const source = fs.readFileSync(input.content.dynamicHtml, 'utf-8');
        const template = handlebars.compile(source)(input.content.values);
        msg.subject = input.content.subject;
        msg.html = template;
        break;
    }
    //send the email
    console.log(msg);
    switch(input.sender.vendor.name) {
      case 'SENDGRID':
        sgMail.setApiKey(input.sender.vendor.API_KEY);
        try {
          const response = await sgMail.send(msg);
          return response;
        }
        catch(err) {
          // console.log('ERR - ', err.response.body.errors);
          return err;
        }
    }
  }

  module.exports = sendEmail;