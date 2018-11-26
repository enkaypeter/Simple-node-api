const express = require('express');
const app = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken');
var apiRoute = express.Router(); 

var config = require('./config');
app.set('hush', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(morgan('dev'));
var countries = ["Ghana","Usa","Nigeria"];
var User = {
    "username" : "admin",
    "password" : "admin"
};
var port = 5050;

apiRoute.post('/login', function(req, res){
    if( (User.username != req.body.username) && (User.password != req.body.password) ){
        res.status(401).json({
            message:"Unauthorized"
        });
    }else{
        const payload = {admin: User.username};
        let token = jwt.sign(payload, app.get('hush'),{
            expiresIn: 1440
        });

        res.status(200).json({
            success: true,
            message: 'Authorisation token',
            token: token
        })
    }
});

apiRoute.use(function(req, res, next){
    let token = req.body.token || req.query.token || req.headers['x-access-token']; 
    
    if(token){
        jwt.verify(token, app.get('hush'), function(err, decoded) {
        
        if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });       
        } else {
            req.decoded = decoded;
            next();
          }
        });
    }else{
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });
    } 
})

apiRoute.get('/countries', function (req, res) {
    return res.status(200).send({
        success: true,
        message: countries
    })
});

apiRoute.put('/countries',function (req, res) {
    console.log(req.body);
    countries.push(req.body.message);
    return res.status(200).send({
        success: true,
        message: "country has been entered successfuly"
    })
});

apiRoute.delete('/countries',function (req, res) {
    var index = countries.indexOf(req.body.message);
    if(index > -1){
        countries.splice(index,1);
    }
    else{
        return res.status(400).send({
            success: false,
            message: "country does not exist"
        });
    } 
    return res.status(200).send({
        success: true,
        message: "country has been deleted successfuly"
    })
});
app.use('/api', apiRoute);

app.listen(port);
console.log('See where it all happens at http://localhost:'+port);