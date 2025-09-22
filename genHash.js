const bcrypt = require("bcryptjs");

const password = "TuClave123";

bcrypt.hash(password, 10).then(hash => {
  console.log("Hash generado:", hash);
});
