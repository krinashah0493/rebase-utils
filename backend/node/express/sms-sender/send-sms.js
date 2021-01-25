const axios = require('axios');

module.exports = {
  sendSms,
}

async function sendSms(receiver, messageText) {
    console.log(receiver, messageText);
    // TODO: Move to config.
    let username = 'wellneshtptrans';
    let password = 'well0968';
    let senderMobile = '9821895528';
    return axios.post(
      `http://www.myvaluefirst.com/smpp/sendsms?username=${username}&password=${password}&to=${receiver}&from=${senderMobile}&text=${messageText}&dlr-mask=19&dlr-url`)
      .catch((e) => console.log(e));
  }