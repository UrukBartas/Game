const Dotenv = require('dotenv-webpack')
console.log(process.env)
module.exports = {
  plugins: [new Dotenv({ ignoreStub: true })],
}
