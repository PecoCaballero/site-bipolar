const app = require('express')()
const dotenv = require('dotenv')
const OAuth = require('oauth')
const fs = require('fs')
dotenv.config()

const url = process.env.URL
const { protocol } = new URL(url)
const PORT = process.env.PORT || 3000

const https = require(protocol.replace(/\W/, ''))


var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.CONSUMER_KEY,
    process.env.CONSUMER_SECRET_KEY,
    '1.0A',
    null,
    'HMAC-SHA1'
)

let json = fs.readFileSync(`${__dirname}/status.json`, 'utf8')

let { test } = JSON.parse(json)
    
console.log('test: ', test)

fs.writeFile(`${__dirname}/status.json`, JSON.stringify({ test: 200 }), 'utf8', () => { })
test = JSON.parse(fs.readFileSync(`${__dirname}/status.json`, 'utf8'))

console.log('test: ', test)

app.listen(PORT, () => {
    console.log('app listening at: ', PORT)

  

    setInterval(() => {
        let { prevStatus } = JSON.parse(fs.readFileSync(`${__dirname}/status.json`, 'utf8'))

        console.log('prevStatus: ', prevStatus)

        https
            .get(url, (res) => {

                let statusCode = res.statusCode
                console.log('current status code: ', statusCode)
                if (statusCode !== prevStatus) {

                    fs.writeFile(`${__dirname}/status.json`, JSON.stringify({ prevStatus: 200 }), 'utf8', () => { })

                    let body = { status: 'O ava caiu :(' }
                    if (statusCode === 200 || statusCode == 301) {
                        body.status = 'O ava voltou :)'
                    }
                    oauth.post(
                        'https://api.twitter.com/1.1/statuses/update.json',
                        process.env.API_KEY,
                        process.env.API_SECRET_KEY,
                        //you can get it at dev.twitter.com for your own apps,
                        body,
                        function (e, data, res) {
                            if (e) console.error(e)
                        })
                    console.log(body)
                }
            })
            .on("error", (e) => {
                console.log(e.statusCode)
            })
    }, 300000)
})