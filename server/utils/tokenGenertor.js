import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_KEY;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_KEY;

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {expiresIn: '1h'});
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {expiresIn: '30d'});
  
  return {accessToken, refreshToken};
}

const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);

    return {success: true, data: decoded}
  } catch(err) {
    return {success: false, message: err.message}
  }
}

const verifyRefreshToken = (token) => {

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);

    return {success: true, data: decoded};

  } catch(err) {
    return {success: false, message: err.message}
  }

}


export {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken
}