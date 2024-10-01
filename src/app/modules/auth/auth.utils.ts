import jwt from 'jsonwebtoken';

export const createJwtToken = (
  jwtPayload: { email: string; id: string; role: string },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, { expiresIn });
};
