export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateToken();

  res
    .status(statusCode)
    .cookie('token', token, {
      httpOnly: true,
      secure: true,   // HTTPS required in production
      sameSite: 'none', // cross-site cookie
      maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    })
    .json({
      success: true,
      user,
      message,
      token
    });
};

