import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const { SECRET_KEY } = dotenv.config().parsed;

const createToken = (payload) => {
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });

  return token;
};

export default createToken;
