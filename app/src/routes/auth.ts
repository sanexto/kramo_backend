import express, { Router, } from 'express';

import { Auth as AuthController, } from '../controllers';

const router: Router = express.Router();

router.get('/login', AuthController.Login.get);
router.post('/login', AuthController.Login.post);

export {
  router as Auth,
}
