import { Request, Response } from 'express';
import { CrudController } from '../CrudController';
import wrapVector from "../../service/vector_service"
import { Stream } from 'stream';


export class VectorController extends CrudController {
    
    public create(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public async read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): Promise<void>{
        var stream = await wrapVector(req.body)
        res.writeHead(
            200,
            {
              "Content-Type": "image/png",
            }
          );
        stream.pipe(res)
    }

    public update(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }

    public delete(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): void {
        throw new Error("Method not implemented.");
    }
}
