var express = require('express')
  , router = express.Router()

  //version 1
router.use('/api/v1/manager', require('./manager/v1'))
router.use('/api/v1/indent', require('./indent/v1'))
router.use('/api/v1/storeUser', require('./storeUser/v1'))
router.use('/api/v1', require('./common/v1'))
router.use('/api/v1/admin', require('./admin/v1'))
router.use('/api/v1/purchaseUser', require('./purchaseUser/v1'))
// router.use('/api/v1/sync', require('./sync/v1'))
router.use('/api/v1/md', require('./md/v1'))



//version 2
router.use('/api/v2/manager', require('./manager/v2'))
router.use('/api/v2/indent', require('./indent/v2'))
router.use('/api/v2/storeUser', require('./storeUser/v2'))
router.use('/api/v2', require('./common/v2'))
router.use('/api/v2/admin', require('./admin/v2'))
router.use('/api/v2/purchaseUser', require('./purchaseUser/v2'))
router.use('/api/v2/sync', require('./sync/v2'))
router.use('/api/v2/md', require('./md/v2'))



//version 3
router.use('/api/v3/manager', require('./manager/v3'))
router.use('/api/v3/indent', require('./indent/v3'))
router.use('/api/v3/storeUser', require('./storeUser/v3'))
router.use('/api/v3', require('./common/v3'))
router.use('/api/v3/admin', require('./admin/v3'))
router.use('/api/v3/purchaseUser', require('./purchaseUser/v3'))
// router.use('/api/v2/sync', require('./sync/v2'))
router.use('/api/v3/md', require('./md/v3'))


//version 4
router.use('/api/v4/manager', require('./manager/v4'))
router.use('/api/v4/indent', require('./indent/v4'))
router.use('/api/v4/storeUser', require('./storeUser/v4'))
router.use('/api/v4', require('./common/v4'))
router.use('/api/v4/admin', require('./admin/v4'))
// router.use('/api/v2/sync', require('./sync/v2'))
router.use('/api/v4/md', require('./md/v4'))
router.use('/api/v4/hod', require('./hod/v4'))
router.use('/api/v4/brill', require('./brill/v4'))

//for 3003 data-----
router.use('/api', require('./storeUser/v4'));

router.use('/api/v5/manager', require('./manager/v5'))
router.use('/api/v5/indent', require('./indent/v5'))
router.use('/api/v5/storeUser', require('./storeUser/v5'))
router.use('/api/v5', require('./common/v5'))
router.use('/api/v5/admin', require('./admin/v5'))
// router.use('/api/v2/sync', require('./sync/v2'))
router.use('/api/v5/md', require('./md/v5'))
router.use('/api/v5/hod', require('./hod/v5'))



module.exports = router