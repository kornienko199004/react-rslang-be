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
  const user = {
    name,
    email,
    password,
    photo: {
      data: req.file // eslint-disable-next-line no-sync
        ? fs.readFileSync(path.join(__dirname, req.file.filename))
        : null,
      contentType: 'image/png'
    }
  };

  await userService.save(user);
  const auth = await userService.authenticate(req.body);
  res.status(OK).json({
    message: 'Authenticated',
    ...auth
  });
});

module.exports = router;
