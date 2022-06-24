const express = require('express');
const mysql = require("mysql");

const Razorpay = require('razorpay')
const { nanoid } = require("nanoid");
const donor_auth = require('../controllers/donor_auth');

const db = mysql.createConnection({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE
});

let razorPayInstance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET
})

const router = express.Router();


router.get('/:id', function (req, res, next) {
	var MartyrId = req.params.id;
	// Render form for accepting amount
	res.render('payment/order', {
		title: 'Donate for Martyrs', MartyrId: MartyrId
	});
});

router.post('/order/:id', donor_auth.isLoggedIn, function (req, res, next) {

	var donorId = req.donor.id;

	var martyrId = req.params.id;

	params = {
		amount: req.body.amount * 100,
		currency: "INR",
		receipt: nanoid(),
		payment_capture: "1"
	}
	razorPayInstance.orders.create(params)
		.then(async (response) => {
			const razorpayKeyId = process.env.RAZORPAY_KEY_ID
			// Save orderId and other payment details

			const paymentDetail = {
				orderId: response.id,
				receiptId: response.receipt,
				amount: response.amount,
				currency: response.currency,
				createdAt: response.created_at,
				status: response.status
			}

			db.query('INSERT INTO donationdetails SET ?', {
				donorId: donorId, martyrId: martyrId, orderId: response.id, receiptId: response.receipt, amount: response.amount, currency: response.currency, createdAt: response.created_at,
				status: response.status
			}, (error, results) => {
				if (error) {
					console.log(error);
				} else {
					console.log(results);
					return res.render('payment/checkout', {
						title: "Confirm Order",
						razorpayKeyId: razorpayKeyId,
						paymentDetail: paymentDetail
					});

				}
			})

		}).catch((err) => {
			// Throw err if failed to create order
			if (err) throw err;
		})
});

router.post('/verify', async function (req, res, next) {
	body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
	let crypto = require("crypto");
	let expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
		.update(body.toString())
		.digest('hex');

	// Compare the signatures
	if (expectedSignature === req.body.razorpay_signature) {

		const verifyDetails = {
			paymentId: req.body.razorpay_payment_id, signature: req.body.razorpay_signature, status: "paid"
		}

		db.query(`UPDATE donationdetails SET ? WHERE orderId= ?`, [verifyDetails, req.body.razorpay_order_id], function (err, data) {

			if (err) throw err;
			console.log(data.affectedRows + " record(s) updated");
		});

		db.query("SELECT * FROM donationdetails WHERE orderId= ?", [req.body.razorpay_order_id], function (err, result) {
			if (err) throw err;
			console.log(result);

			const doc = {
				orderId: result[0].orderId,
				receiptId: result[0].receiptId,
				amount: result[0].amount,
				currency: result[0].currency,
				createdAt: result[0].createdAt,
				status: result[0].status,
				signature: result[0].signature,
				paymentId: result[0].paymentId
			}
			res.render('payment/success', {
				title: "Payment verification successful",
				paymentDetail: doc
			})
		});




	} else {
		res.render('payment/fail', {
			title: "Payment verification failed",
		})
	}
});


module.exports = router;

