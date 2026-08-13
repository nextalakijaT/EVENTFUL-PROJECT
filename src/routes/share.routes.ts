import { Router } from 'express';
import { resolveShortLink, getShareMetadata } from '../controllers/share.controller';

const router = Router();

router.get('/:shortId', resolveShortLink);
router.get('/meta/:id', getShareMetadata);

export default router;