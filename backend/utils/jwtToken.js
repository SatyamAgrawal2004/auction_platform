export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      sameSite: "Lax", // Use 'None' if you're using cross-domain cookies
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
