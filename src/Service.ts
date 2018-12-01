import { Container, interfaces } from 'inversify';

import { GrpcServer } from 'GrpcServer';
import { IService } from 'interfaces/IService';

interface IServiceOptions {
    services: { new(...args: any[]): IService }[];
    proto: any;
}

export class Service {
    private readonly container: Container;
    private readonly grpcServer: GrpcServer

    constructor(private serviceConfig: IServiceOptions) {
        this.container = new Container();

        this.container.bind('protoconfig').toConstantValue(serviceConfig.proto);
        this.container.bind<GrpcServer>(GrpcServer).toSelf();
        this.grpcServer = this.container.get(GrpcServer);

        this.registerServices();

        this.grpcServer.start();
    }

    private registerServices(): void {
        for (const service of this.serviceConfig.services) {
            const factory = this.container.get<interfaces.Factory<IService>>(`Factory${service}`);

            this.grpcServer.registerService(factory);
        }
    }
}