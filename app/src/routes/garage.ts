import express, { Router, } from 'express';

import { Garage as GarageController, } from '../controllers';

const router: Router = express.Router();

router.get('/', GarageController.Home.get);

router.get('/reservation/list', GarageController.Reservation.ListReservation.get);
router.get('/reservation/list/:reservationId', GarageController.Reservation.ViewReservation.get);
router.get('/reservation/add', GarageController.Reservation.AddReservation.get);
router.post('/reservation/add', GarageController.Reservation.AddReservation.post);
router.get('/reservation/update/:reservationId', GarageController.Reservation.UpdateReservation.get);
router.put('/reservation/update/:reservationId', GarageController.Reservation.UpdateReservation.put);
router.get('/reservation/delete/:reservationId', GarageController.Reservation.DeleteReservation.get);
router.delete('/reservation/delete/:reservationId', GarageController.Reservation.DeleteReservation.delete);

router.get('/account/update', GarageController.Account.UpdateAccount.get);
router.put('/account/update', GarageController.Account.UpdateAccount.put);
router.get('/password/update', GarageController.Account.UpdatePassword.get);
router.put('/password/update', GarageController.Account.UpdatePassword.put);

export {
  router as Garage,
}
