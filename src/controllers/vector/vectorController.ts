import { Request, Response } from 'express';
import { CrudController } from '../CrudController';
import wrapVector from "../../service/vector_service"


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
            console.log(error);
        }

    }

    public async read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): Promise<void> {
        //NOTE: There is no Update method for the Vector.
    }

    public update(_req: Request<import("express-serve-static-core").ParamsDictionary>, _res: Response): void {
        //NOTE: There is no Update method for the Vector.
    }

    public delete(_req: Request<import("express-serve-static-core").ParamsDictionary>, _res: Response): void {
         //NOTE: There is no Delete method for the Vector.
    }
}
