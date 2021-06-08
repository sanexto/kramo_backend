import express, { Router, } from 'express';

import { Admin as AdminController, } from '../controllers';

const router: Router = express.Router();

router.get('/', AdminController.Home.get);

router.get('/garage', AdminController.Garage.Home.get);
router.get('/garage/list', AdminController.Garage.ListGarage.get);
router.get('/garage/list/:userId', AdminController.Garage.ViewGarage.get);
router.get('/garage/add', AdminController.Garage.AddGarage.get);
router.post('/garage/add', AdminController.Garage.AddGarage.post);
router.get('/garage/update/:userId', AdminController.Garage.UpdateGarage.get);
router.put('/garage/update/:userId', AdminController.Garage.UpdateGarage.put);
router.get('/garage/delete/:userId', AdminController.Garage.DeleteGarage.get);
router.delete('/garage/delete/:userId', AdminController.Garage.DeleteGarage.delete);

router.get('/admin', AdminController.Admin.Home.get);
router.get('/admin/list', AdminController.Admin.ListAdmin.get);
router.get('/admin/list/:userId', AdminController.Admin.ViewAdmin.get);
router.get('/admin/add', AdminController.Admin.AddAdmin.get);
router.post('/admin/add', AdminController.Admin.AddAdmin.post);
router.get('/admin/update/:userId', AdminController.Admin.UpdateAdmin.get);
router.put('/admin/update/:userId', AdminController.Admin.UpdateAdmin.put);
router.get('/admin/delete/:userId', AdminController.Admin.DeleteAdmin.get);
router.delete('/admin/delete/:userId', AdminController.Admin.DeleteAdmin.delete);

router.get('/account/update', AdminController.Account.UpdateAccount.get);
router.put('/account/update', AdminController.Account.UpdateAccount.put);
router.get('/password/update', AdminController.Account.UpdatePassword.get);
router.put('/password/update', AdminController.Account.UpdatePassword.put);

export {
  router as Admin,
}
