const {Router} = require('express')
const router = Router()
const userController = require("../controllers/userController");
const mongoose = require("mongoose")
const User = require('../models/User')
const sha256 = require("js-sha256");
const { check, validationResult } = require('express-validator');
const jwt = require('jwt-then')


router.post(
    "/register", 
    [
        check('email', 'Invalid email').isEmail(),
        check('password', 'Password must be atleast 6 characters long.').isLength({ min: 6 }),
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


        const {name, email, password} = req.body

        const candidate = await User.findOne({email})

        if(candidate) {
            return res.status(400).json({message: 'User Exist'})
        }

        if (name.length< 3) throw "Login must be atleast 3 characters long"



        const user = new User({ name, email, password: sha256(password+process.env.SALT) })

        await user.save()

        res.json({
            message: `User ${name} register`
        })
    } catch (error) {
        res.status(500).json({ message: 'Error'})
    }
})

router.post(
    '/login',
    async (req, res) => {
        try {
            const {email, password} = req.body
            const user = await User.findOne({
                email,
                password: sha256(password + process.env.SALT),
            })
            if(!user) throw "Email and Password did not match."

            const token = jwt.sign({id: user.id}, process.env.SECRET)

            res.json({
                message:"User logged in succsessul",
                token
            })

        } catch (error) {
            res.status(500).json({ message: 'Error'})
        }
    }
)

module.exports = router;