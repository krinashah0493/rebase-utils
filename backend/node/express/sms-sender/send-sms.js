const axios = require('axios');

async function sendSms(input) {
    console.log(input.receiver, input.content.messageText);
    // TODO: Move to config.
    let username = input.sender.username;
    let password = input.sender.password;
    let senderMobile = input.sender.mobile;

    switch(input.sender.vendor.name) {
      case 'MY_VALUE_FIRST':
        return axios.post(
          `http://www.myvaluefirst.com/smpp/sendsms?username=${username}&password=${password}&to=${receiver}&from=${senderMobile}&text=${messageText}&dlr-mask=19&dlr-url`)
          .catch((e) => console.log(e));
    }
  }

  module.exports = {
    sendSms,
  }