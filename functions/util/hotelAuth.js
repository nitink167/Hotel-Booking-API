const { admin, db } = require('./admin');

module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Hotel ')
  ) {
    idToken = req.headers.authorization.split('Hotel ')[1];
  } else {
    console.error('No token found');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection('hotels')
        .where('hotelId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.hotelId = data.docs[0].data().hotelId;
      console.log(req.user.hotelId)
      return next();
    })
    .catch((err) => {
      console.error('Error while verifying token ', err);
      return res.status(403).json(err);
    });
};
