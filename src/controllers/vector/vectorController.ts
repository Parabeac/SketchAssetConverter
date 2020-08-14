import { Request, Response } from 'express';
import { CrudController } from '../CrudController';
import wrapVector from "../../service/vector_service"


export class VectorController extends CrudController {
    
    public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void{
        wrapVector(req.body)
        res.json(req.body);
    }

    public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }
}
