import express, { Router, } from 'express';

import { Garage as GarageController, } from '../controllers';

const router: Router = express.Router();

router.get('/', GarageController.Home.get);

router.get('/booking/list', GarageController.Booking.ListBooking.get);
router.get('/booking/list/:bookingId', GarageController.Booking.ViewBooking.get);
router.get('/booking/add', GarageController.Booking.AddBooking.get);
router.post('/booking/add', GarageController.Booking.AddBooking.post);
router.get('/booking/update/:bookingId', GarageController.Booking.UpdateBooking.get);
router.put('/booking/update/:bookingId', GarageController.Booking.UpdateBooking.put);
router.get('/booking/delete/:bookingId', GarageController.Booking.DeleteBooking.get);
router.delete('/booking/delete/:bookingId', GarageController.Booking.DeleteBooking.delete);

router.get('/account/update', GarageController.Account.UpdateAccount.get);
router.put('/account/update', GarageController.Account.UpdateAccount.put);
router.get('/password/update', GarageController.Account.UpdatePassword.get);
router.put('/password/update', GarageController.Account.UpdatePassword.put);

export {
  router as Garage,
}
