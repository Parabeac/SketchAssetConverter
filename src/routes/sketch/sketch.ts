import express, { Request, Response } from 'express';
import { sketchController } from '../../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    sketchController.create(req, res);
});

router.get('/', (req: Request, res: Response) => {
    sketchController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    sketchController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    sketchController.delete(req, res);
});
