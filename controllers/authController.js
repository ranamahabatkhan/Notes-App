const User = require('../models/User');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    req.session.user = { id: user._id, username: user.username };
    res.redirect('/notes');
  } catch (err) {
    res.render('auth/register', { error: 'Username already exists.' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      // Always show a generic error for login failures
      return res.render('auth/login', { error: 'Invalid username or password.' });
    }
    req.session.user = { id: user._id, username: user.username };
    res.redirect('/notes');
  } catch (err) {
    res.render('auth/login', { error: 'Login error.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};