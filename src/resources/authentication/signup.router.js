const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OK } = require('http-status-codes');

const userService = require('../users/user.service');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __dirname);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  }
});

// init upload as middleware
const upload = multer({ storage });

router.route('/').post(upload.single('image'), async (req, res) => {
  const { name, email, password } = req.body;
  // eslint-disable-next-line no-sync
  const imgData = fs.readFileSync(path.join(__dirname, req.file.filename));
  const user = {
    name,
    email,
    password,
    photo: `data:image/png;base64,${imgData.toString('base64')}`
  };

  await userService.save(user);
  const auth = await userService.authenticate(req.body);
  res.status(OK).json({
    message: 'Authenticated',
    ...auth
  });
});

module.exports = router;
