import { Request, Response } from 'express';
import { CrudController } from '../CrudController';
import wrapVector from "../../service/vector_service"
import { Stream } from 'stream';


export class VectorController extends CrudController {

    public async create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): Promise<void> {
        try {

            var stream = await wrapVector(req.body)
            res.writeHead(
                200,
                {
                    "Content-Type": "image/png",
                }
            );
            stream.pipe(res)
        } catch (error) {
            console.error(error);
            res.status(400).send({ error: 'Could not process vector' });
        }

    }

    public async read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }
}
