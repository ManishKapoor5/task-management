import { add, getAll, getOne, remove, toggle, update } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware'
import { Router } from 'express'

const router = Router();

router.post('/tasks', authMiddleware, add)

router.get('/tasks', authMiddleware, getAll)

router.get('/tasks/:id', authMiddleware, getOne)

router.delete('/tasks/:id', authMiddleware, remove)

router.patch('/tasks/:id', authMiddleware, update)

router.patch('/tasks/:id/toggle', authMiddleware, toggle)

export default router