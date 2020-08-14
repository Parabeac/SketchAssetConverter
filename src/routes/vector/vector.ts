import express, { Request, Response } from 'express';
import { vectorController } from '../../controllers';

export const router = express.Router({
    strict: true
});

router.post('/', (req: Request, res: Response) => {
    vectorController.create(req, res);
});

router.get('/', (req: Request, res: Response) => {
    vectorController.read(req, res);
});

router.patch('/', (req: Request, res: Response) => {
    vectorController.update(req, res);
});

router.delete('/', (req: Request, res: Response) => {
    vectorController.delete(req, res);
});
