const jwt = require('jsonwebtoken')
const User = require('../../../models/user')

/*
    POST /api/auth
    {
        username,
        password
    }
*/

exports.login = (req, res) => {
    const {username, password} = req.body
    const secret = req.app.get('jwt-secret')
    const check = (user) => {
        if(!user) {
            //유저정보가 없다면
            throw new Error('login failed')
        } else {
            //패스워드 체크
            if(user.verify(password)) {
                const p = new Promise((resolve, reject) => {
                    jwt.sign(
                        {
                            _id: user._id,
                            username: user.username,
                            admin: user.admin
                        }, 
                        secret, 
                        {
                            expiresIn: '7d',
                            issuer: 'velopert.com',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve(token) 
                        })
                })
                return p
            } else {
                throw new Error('login failed')
            }
        }
    }

    // 토큰 response
    const respond = (token) => {
        res.json({
            message: 'logged in successfully',
            token
        })
    }

    // 에러처리
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        })
    }

    // 유저찾기
    User.findOneByUsername(username)
    .then(check)
    .then(respond)
    .catch(onError)

}

exports.register = (req, res) => {
    const { username, password } = req.body
    let newUser = null

    //유저생성
    const create = (user) => {
        if(user) {
            throw new Error('username exists')
        } else {
            return User.create(username, password)
        }
    }

    //유저 수
    const count = (user) => {
        newUser = user
        return User.count({}).exec()
    }

    //유저가 1명이라면 어드민으로 지정
    const assign = (count) => {
        if(count === 1) {
            return newUser.assignAdmin()
        } else {
            return Promise.resolve(false)
        }
    }

    //클라이언트 response
    const respond = (isAdmin) => {
        res.json({
            message: 'registered successfully',
            admin: isAdmin ? true : false
        })
    }

    //에러처리
    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    //중복확인
    User.findOneByUsername(username)
    .then(create)
    .then(count)
    .then(assign)
    .then(respond)
    .catch(onError)
}

exports.check = (req, res) => {
    const token = req.headers['x-access-token'] || req.query.token

    // 토큰이 없다면
    if(!token) {
        return res.status(403).json({
            success: false,
            message: 'not logged in'
        })
    }

    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    const respond = (token) => {
        res.json({
            success: true,
            info: token
        })
    }

    //확인 실패시 오류메세지 반환
    const onError = (error) => {
        res.status(403).json({
            success: false,
            message: error.message
        })
    }

    p.then(respond).catch(onError)
}

exports.check = (req, res) => {
    res.json({
        success: true,
        info: req.decoded
    })
}