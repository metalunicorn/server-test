require("dotenv").config();

const {Router} = require('express')
const router = Router()
const User = require("../models/User");
const sha256 = require("js-sha256");
const { check, body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');




router.post(
    "/register", 
    [
        check('password', 'Password must be atleast 6 characters long.').isLength({ min: 6 }),
        body('name').custom(value => {
            reg4 = /^[A-Za-z0-9]+$/
            console.log(value)
            if(!(value.length>3 && reg4.test(value))){
                return false 
                
            }
            return true; 
            
          }),
    ],
    async (req, res) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: 'Invalid data'

            })
        }
        let admin = false
        const query = User.find()
        query.count(function (err, count) {
            if(count < 1) admin = true
        });
        const {name, password} = req.body

        const candidate = await User.findOne({name})

        if(candidate) {
            const user = await User.findOne({
                name,
                password: sha256(password + process.env.SALT),
            })
            if(!user) throw "Invalid Password"

            const token = jwt.sign({id: user.id, admin: user.admin, name: user.name}, process.env.SECRET)

            return res.json({
                message:"User logged in succsessul",
                token
            })
        }
        function getRandomColor() {
          var letters = '0123456789ABCDEF';
          var color = '#';
          for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }

        const user = new User({ name, password: sha256(password+process.env.SALT), color: getRandomColor(), admin: admin, mute:false, ban:false})

        await user.save()

        res.json({
            message: `User ${name} register`
        })
    } catch (error) {
        res.status(500).json({ 
            errors: error,
            message: 'Password invalid.' 
        })
    }
})

module.exports = router;