import { Request, Response } from 'express';
import { CrudController } from '../CrudController';
import { processLocalVector, wrapVector } from "../../service/vector_service"

const fs = require('fs-extra')

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

    public async createLocal(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): Promise<void> {
        try {
            var stream = await processLocalVector(req.body.uuid, req.body.path)
            res.writeHead(
                200,
                {
                    "Content-Type": "image/png",
                }
            );
            stream.pipe(res)
        } catch (error) {
            console.error(error);
            res.status(400).send({ error: 'Sketchtool is not installed or was not detected.' });
        }
    }

    public async read(req: Request<import("express-serve-static-core").ParamsDictionary>, res: Response): Promise<void> {
        fs.readFile('/Users/ivanvigliante/Documents/parabeac/Parabeac-Core/TestingSketch/inspyred_demo.sketch',
            function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            });
    }

    public update(_req: Request<import("express-serve-static-core").ParamsDictionary>, _res: Response): void {
        //NOTE: There is no Update method for the Vector.
    }

    public delete(_req: Request<import("express-serve-static-core").ParamsDictionary>, _res: Response): void {
        //NOTE: There is no Delete method for the Vector.
    }
}
