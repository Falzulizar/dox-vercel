//DOX//CONFIG.JS
require('dotenv').config();

module.exports = {
  TOKEN: process.env.TOKEN,
  APIKEY: process.env.APIKEY,
  OWNERID: process.env.OWNERID,
  GROUPID: process.env.GROUPID ? Number(process.env.GROUPID) : null
};
