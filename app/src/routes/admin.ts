import express, { Router, } from 'express';

import { User as UserBase, } from '../base';
import { tokenAuth, } from '../middlewares';
import { Admin as AdminController, } from '../controllers';

const router: Router = express.Router();

router.get('/', tokenAuth(UserBase.Profile.Admin), AdminController.Home.get);

router.get('/garage', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.Home.get);
router.get('/garage/list', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.ListGarage.get);
router.get('/garage/list/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.ViewGarage.get);
router.get('/garage/add', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.AddGarage.get);
router.post('/garage/add', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.AddGarage.post);
router.get('/garage/update/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.UpdateGarage.get);
router.put('/garage/update/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.UpdateGarage.put);
router.get('/garage/delete/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.DeleteGarage.get);
router.delete('/garage/delete/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Garage.DeleteGarage.delete);

router.get('/admin', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.Home.get);
router.get('/admin/list', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.ListAdmin.get);
router.get('/admin/list/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.ViewAdmin.get);
router.get('/admin/add', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.AddAdmin.get);
router.post('/admin/add', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.AddAdmin.post);
router.get('/admin/update/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.UpdateAdmin.get);
router.put('/admin/update/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.UpdateAdmin.put);
router.get('/admin/delete/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.DeleteAdmin.get);
router.delete('/admin/delete/:userId', tokenAuth(UserBase.Profile.Admin), AdminController.Admin.DeleteAdmin.delete);

router.get('/account/update', tokenAuth(UserBase.Profile.Admin), AdminController.Account.UpdateAccount.get);
router.put('/account/update', tokenAuth(UserBase.Profile.Admin), AdminController.Account.UpdateAccount.put);
router.get('/password/update', tokenAuth(UserBase.Profile.Admin), AdminController.Account.UpdatePassword.get);
router.put('/password/update', tokenAuth(UserBase.Profile.Admin), AdminController.Account.UpdatePassword.put);

router.get('/auth/login', AdminController.Auth.Login.get);
router.post('/auth/login', AdminController.Auth.Login.post);

export {
  router as Admin,
}
