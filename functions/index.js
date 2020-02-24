const functions = require('firebase-functions');
const express = require('express')
const cors = require('cors');

const app = express()
app.use(cors());

const { fetchHotels, signupUser, loginUser, fetchHotelDetails, fetchSingleRoom } = require('./handlers/userRoutes');
const { signupHotel, loginHotel, addRoom } = require('./handlers/hotelRoutes');
const hotelAuth = require('./util/hotelAuth');
const userAuth = require('./util/userAuth');

//Routes for Users
app.post('/signupUser', signupUser)
app.post('/loginUser', loginUser)
app.get('/hotels', fetchHotels)
app.get('/hotels/:hotelId', fetchHotelDetails)
app.get('/hotels/:hotelId/:roomId', fetchSingleRoom)

//Routes for hotels
app.post('/signupHotel', signupHotel)
app.post('/loginHotel', loginHotel)
app.post('/addRoom', hotelAuth, addRoom)



exports.api = functions.https.onRequest(app);
