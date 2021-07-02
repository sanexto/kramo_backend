import express, { Router, } from 'express';

import { User as UserBase, } from '../base';
import { tokenAuth, } from '../middlewares';
import { Garage as GarageController, } from '../controllers';

const router: Router = express.Router();

router.get('/', tokenAuth(UserBase.Profile.Garage), GarageController.Home.get);

router.get('/booking/list', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.ListBooking.get);
router.get('/booking/list/:bookingId', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.ViewBooking.get);
router.get('/booking/add', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.AddBooking.get);
router.post('/booking/add', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.AddBooking.post);
router.get('/booking/update/:bookingId', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.UpdateBooking.get);
router.put('/booking/update/:bookingId', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.UpdateBooking.put);
router.get('/booking/delete/:bookingId', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.DeleteBooking.get);
router.delete('/booking/delete/:bookingId', tokenAuth(UserBase.Profile.Garage), GarageController.Booking.DeleteBooking.delete);

router.get('/account/update', tokenAuth(UserBase.Profile.Garage), GarageController.Account.UpdateAccount.get);
router.put('/account/update', tokenAuth(UserBase.Profile.Garage), GarageController.Account.UpdateAccount.put);
router.get('/password/update', tokenAuth(UserBase.Profile.Garage), GarageController.Account.UpdatePassword.get);
router.put('/password/update', tokenAuth(UserBase.Profile.Garage), GarageController.Account.UpdatePassword.put);

router.get('/auth/login', GarageController.Auth.Login.get);
router.post('/auth/login', GarageController.Auth.Login.post);
router.get('/auth/signup', GarageController.Auth.Signup.get);
router.post('/auth/signup', GarageController.Auth.Signup.post);

export {
  router as Garage,
};
