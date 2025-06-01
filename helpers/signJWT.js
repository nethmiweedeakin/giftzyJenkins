const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

const signJWT = ({ id, name, email, avatar, buyer }) => {
  const token = jwt.sign({ id, name, email, avatar, buyer }, JWT_SECRET, {
    expiresIn: '1h',
  });

  return token;
};

module.exports = signJWT;
