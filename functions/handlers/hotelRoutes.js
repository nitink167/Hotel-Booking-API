const { admin, db } = require('../util/admin');

const firebase = require('../util/firebase')

//Signup User
exports.signupHotel = (req, res) => {
	const newHotelData = {
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		mobile: req.body.mobile,
		description: req.body.description
	}

	let errors = {}

	if(newHotelData.name.trim() === "") errors.name = "Must not be empty";
	if(newHotelData.email.trim() === "") errors.email = "Must not be empty";
	if(newHotelData.password.trim() === "") errors.password = "Must not be empty";
	if(newHotelData.password !== newHotelData.confirmPassword) errors.confirmPassword = "Must match correctly";
	if(newUserData.mobile.toString().length !== 10) errors.mobile = "Must be 10 digits";
	if(newHotelData.description.trim() === "") errors.email = "Must not be empty";

	if(Object.keys(errors).length > 0) {
		return res.status(400).json(errors)
	} else {
		let hotelToken, hotelId
		db.doc(`/hotels/${newHotelData.email}`).get()
		    .then((doc) => {
		      if (doc.exists) {
		        return res.status(400).json({ email: 'this email is already in use' });
		      } else {
		        return firebase.auth().createUserWithEmailAndPassword(newHotelData.email, newHotelData.password)
		      }
		    })
			.then((data) => {
				hotelId = data.user.uid
				return data.user.getIdToken()
			})
			.then((idToken) => {
				hotelToken = idToken
				const hotelCredentials = {
					hotelId: hotelId,
					name: newHotelData.name,
					email: newHotelData.email,
					mobile: newHotelData.mobile,
					description: newHotelData.description,
					userImageUrl: "abc.jpg"
				}
				return db.doc(`/hotels/${newHotelData.email}`).set(hotelCredentials)
			})
			.then(() => {
				return res.status(200).json({hotelToken})
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
exports.loginHotel = (req, res) => {
	const hotelData = {
		email: req.body.email,
		password: req.body.password
	}
	let hotelId,
		fetchedHotelToken = {},
		fetchedHotelDetails = [],
		rooms = [],
		bookingNotifications = []

	firebase.auth().signInWithEmailAndPassword(hotelData.email, hotelData.password)
		.then(data => {
			hotelId = data.user.uid
			return data.user.getIdToken()
		})
		.then((idToken) => {
			fetchedHotelToken = {
				token: idToken
			}
			return db.collection("hotels").where('hotelId', '==', hotelId).get()
		})
		.then((data) => {
			data.forEach(doc => {
				fetchedHotelDetails.push(doc.data())
			})
			return db.collection("hotelRooms").where('hotelId', '==', hotelId).get()
		})
		.then((data) => {
			console.log("Rooms Data", data)
			data.forEach((room) => {
				rooms.push(room.data())
			})
			fetchedHotelDetails.push(rooms)
			return db.collection("bookingNotifications").where('hotelId', '==', hotelId).get()
		})
		.then((data) => {
			console.log("notification Data", data)
			data.forEach((notification) => {
				bookingNotifications.push(notification.data())
			})
			fetchedHotelDetails.push(bookingNotifications)
			fetchedHotelDetails.push(fetchedHotelToken)
			return res.json(fetchedHotelDetails)
		})
		.catch((err) => {
			console.log(err)
			return res.json(err)
		})
}

//Add Room
exports.addRoom = (req, res) => {
	const newRoomData = {
		roomName: req.body.roomName,
		roomDescription: req.body.roomDescription,
		totalRooms: req.body.totalRooms,
		hotelId: req.user.userId
	}
	let roomData
	db.collection(`/hotelRooms/`).add(newRoomData)
		.then((doc) => {
			roomData = {
				roomName: doc.data().roomName,
				roomDescription: doc.data().roomDescription,
				totalRooms: doc.data().totalRooms,
				hotelId: doc.data().hotelId,
				roomId: doc.id
			}
			return db.collection(`/hotelRooms/`).set(roomData)
		})
		.then((doc) => {
			return res.json(doc.data())
		})
		.catch(err => {
			console.log(err)
			res.json(err)
		})
}
