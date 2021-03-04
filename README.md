# rebase-utils
Automate backend functionalities with rebase-utils. Just provide a file containing the required endpoint names and authenticated user roles in a JSON format and delegate the following responsibilities to rebase-utils keeping your code base simple and clean:
1. Generate API-endpoints.
2. Authenticate incoming requests granting custom access to different api-endpoints.
3. Send dynamic html/template via email to a list of users through "Send Grid" (more vendors supported in future versions).
4. Send sms to a list of users through "My Value First" (more vendors supported in future versions).
5. Generate databases and collections on the fly with dbGenerator and perform CRUD operations on them.
## Installing rebase-utils package: Add the following to dependencies
###  "rebase-utils": "https://github.com/krinashah0493/rebase-utils.git"

## Importing api-generator
### const apiGenerator = require('rebase-utils/backend/node/express/api-generator');

## Importing Authentication Middleware(isAuthenticated)
### const isAuthenticated = require('rebase-utils/backend/node/express/authentication-middleware);

## Importing email-sender service
### const { sendEmail } = require("rebase-utils/backend/node/express/email-sender");

## Importing sms-sender service
### const { sendSms } = require('rebase-utils/backend/node/express/sms-sender');


