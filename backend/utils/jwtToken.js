export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      sameSite: "None", // ✅ Required for cross-origin (frontend & backend on different domains)
      secure: true, // ✅ Required with sameSite: "None", ensures cookie sent only over HTTPS
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
