users : {
	userId: ID,
	name: String,
	email: String,
	mobile: Number,
	userImageUrl: String
}

hotels : {
	hotelId: ID,
	name: String,
	email: String,
	description: String,
	hotelImageUrl: String,
}

hotelRooms : {
	roomId: String,
	hotelId: String,
	roomName: String,
	roomImageUrl: String,
	description: String,
	totalRooms: Number
}

bookings : {
	userEmail : String,
	name: String,
	mobile: Number,
	date: String,
	hotelId: String,
	roomName: String
}

bookingNotification: {
	name: String,
	userEmail: String,
	mobile: Number,
	date: String
	hotelId: ID,
	roomId: String,
	totalRoomsRequested: Number,
	verify: Boolean
}
