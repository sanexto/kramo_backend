import express, { Router, } from 'express';

import { User as UserBase, } from '../base';
import { tokenAuth, } from '../middlewares';
import { Garage as GarageController, } from '../controllers';

const router: Router = express.Router();

router.get('/', tokenAuth(UserBase.Profile.Garage), GarageController.Home.get);

router.get('/parking/list', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.ListParking.get);
router.get('/parking/list/:parkingId', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.ViewParking.get);
router.get('/parking/add', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.AddParking.get);
router.post('/parking/add', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.AddParking.post);
router.get('/parking/update/:parkingId', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.UpdateParking.get);
router.put('/parking/update/:parkingId', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.UpdateParking.put);
router.get('/parking/delete/:parkingId', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.DeleteParking.get);
router.delete('/parking/delete/:parkingId', tokenAuth(UserBase.Profile.Garage), GarageController.Parking.DeleteParking.delete);

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
