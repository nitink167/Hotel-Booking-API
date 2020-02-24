const { admin, db } = require('../util/admin');

const firebase = require('../util/firebase')

//Signup User
exports.signupUser = (req, res) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		mobile: req.body.mobile
	}

	let errors = {}

	if(newUserData.name.trim() === "") errors.name = "Must not be empty";
	if(newUserData.email.trim() === "") errors.email = "Must not be empty";
	if(newUserData.password.trim() === "") errors.password = "Must not be empty";
	if(newUserData.password !== newUserData.confirmPassword) errors.confirmPassword = "Must match correctly"
	if(newUserData.mobile.toString().length !== 10) errors.mobile = "Must be 10 digits";

	if(Object.keys(errors).length > 0) {
		return res.status(400).json(errors)
	} else {
		let token, userId
		db.doc(`/users/${newUserData.email}`).get()
		    .then((doc) => {
		      if (doc.exists) {
		        return res.status(400).json({ email: 'this email is already in use' });
		      } else {
		        return firebase.auth().createUserWithEmailAndPassword(newUserData.email, newUserData.password)
		      }
		    })
			.then((data) => {
				userId = data.user.uid
				return data.user.getIdToken()
			})
			.then((idToken) => {
				token = idToken
				const userCredentials = {
					userId,
					name: newUserData.name,
					email: newUserData.email,
					mobile: newUserData.mobile,
					userImageUrl: "abc.jpg"
				}
				return db.doc(`/users/${newUserData.email}`).set(userCredentials)
			})
			.then(() => {
				return res.status(200).json({token})
			})
			.catch((err) => {
				console.log(err)
				if(err.code = "auth/invalid-email") {
					return res.status(500).json({ email : "Wrong Email"})
				} else {
					return res.status(500).json({ general : "Wrong credentials"})
				}
			})
	}
}

//Login User
exports.loginUser = (req, res) => {
	const userData = {
		email: req.body.email,
		password: req.body.password
	}
	let userId, userTokenFetched = {}
	firebase.auth().signInWithEmailAndPassword(userData.email, userData.password)
		.then(data => {
			userId = data.user.uid
			return data.user.getIdToken()
		})
		.then((idToken) => {
			userTokenFetched = {
				token: idToken
			}
			return db.collection("users").where('userId', '==', userId).get()
		})
		.then((data) => {
			let userData = []
			data.forEach(doc => {
				userData.push(doc.data())
			})
			userData.push(userTokenFetched)
			return res.json(userData)
		})
		.catch((err) => {
			console.log(err)
			return res.json(err)
		})
}

//Fetch Hotels
exports.fetchHotels = (req, res) => {
	db.collection('hotels').get()
	.then(data => {
		let hotels = []
		data.forEach(doc => {
			hotels.push(doc.data())
		})
		return res.json(hotels)
	})
	.catch(err => {
		console.log(err)
		return res.json(err)
	})
}

//Fecth All Rooms
exports.fetchHotelDetails = (req, res) => {
	let hotelData = {}
	db.collection("hotels").where('hotelId', '==', req.params.hotelId).get()
		.then((doc) => {
			doc.forEach((hotel) => {
				hotelData = hotel.data()
			})
			return db.collection("hotelRooms").where('hotelId', '==', req.params.hotelId).get()
		})
		.then((doc) => {
			doc.forEach((room) => {
				hotelData.rooms = room.data()
			})
			return res.json(hotelData)
		})
		.catch((err) => {
			console.log(err)
			return res.json("No Rooms Found")
		})
}

//Fetch Single Room
exports.fetchSingleRoom = (req, res) => {
	db.doc(`hotelRooms/${req.params.roomId}`).get()
		.then((doc) => {
			let roomsData = {}
			roomsData = doc.data()
			return res.json(roomsData)
		})
		.catch((err) => {
			console.log(err)
			return res.json(err)
		})
}
