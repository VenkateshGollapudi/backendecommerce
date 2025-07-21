const userCtrl = require('../controllers/userCtrl');
// import auth from '../controllers/middleware/auth';
const router=require('express').Router();
const auth=require('../middleware/auth');
router.post('/register',userCtrl.register);
router.post('/login',userCtrl.login);
router.get('/logout',userCtrl.logout);
router.get('/infor',auth,userCtrl.getUser);
router.post('/refresh_token',userCtrl.refreshtoken);

module.exports=router;