const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');

const User = require('../../models/user');

exports.postLogin = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const err = new Error();
      err.statusCode = 401;
      err.lista = errors.array();
      throw err;
    }

    const user = await User.login(req.body);

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      'somesupersecretsecret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email
      },
      token: token
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}