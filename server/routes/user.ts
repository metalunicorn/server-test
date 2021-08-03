/* eslint-disable @typescript-eslint/no-var-requires */
const { Router } = require('express');
const { check, body } = require('express-validator');
const userController = require('../controllers/userControllers');

const router = Router();

router.post(
  '/register',
  [
    check('password', 'Password must be atleast 6 characters long.').isLength({
      min: 6,
    }),
    body('name').custom((value: string) => {
      const regRule = /^[A-Za-z0-9]+$/;
      // if (!(value.length > 3 && regRule.test(value))) {
      //   return false;
      // }

      return value.length > 3 && regRule.test(value);
    }),
  ],
  userController
);

module.exports = router;
