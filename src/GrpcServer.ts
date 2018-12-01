import { injectable, inject, interfaces } from 'inversify';
import { load, Server, ServerCredentials, status } from 'grpc';

import { IGrpcService } from 'interfaces/IGrpcService';
import { IContext } from 'interfaces/IContext';
import { IServiceResponse } from 'interfaces/IServiceResponse';

interface IUnaryCall {
    cancelled: boolean;
    metadata: any;
    request: any;
}

interface IMethodDefinition {
    originalName: string;
    path: string;
    requestStream: boolean;
    responseStream: boolean;
    requestType: Object;
    responseType: Object;
}

interface IServiceDefinition {
    service: {
        [method: string]: IMethodDefinition;
    };
}

interface IMessageDefinition {
    [key: string]: any;
}

interface IProtobufDefinition {
    [service: string]: IServiceDefinition | IMessageDefinition;
}

interface IPackagedProtobufDefinition {
    [packageName: string]: IProtobufDefinition;
}

type CallbackFn = (error: { code: number, details?: string } | null, content: string | null) => any;

type HandlerFn = (call: IUnaryCall, callback: CallbackFn) => any;

@injectable()
export class GrpcServer {

    private server: any;
    private services: any = {};
    private proto: IPackagedProtobufDefinition | IProtobufDefinition;

    constructor(
        @inject('protoconfig') private readonly protoConfig: any
    ) {
        this.proto = load(this.protoConfig.path);
    }

    public registerService(serviceFactory: interfaces.Factory<IGrpcService>): void {
        const serviceName = (<IGrpcService>serviceFactory()).grpcMethod;

        if (!this.service[serviceName]) {
            // ERROR
        }

        const handler: HandlerFn = (call: IUnaryCall, callback: CallbackFn) => {
            const context = this.createContext(call.metadata);
            const service = <IGrpcService>serviceFactory();

            service.handler(context, call.request)
            .then((response: IServiceResponse) => callback(null, response.content))
            .catch((error: Error) => {
                const errorResponse = {
                    code: status.INTERNAL,
                    details: error.message
                };

                callback(errorResponse, null);
            });
        }

        this.services[serviceName] = handler;
    }

    public start(): void {
        this.server = new Server();
        this.server.addService(this.service, this.services);
        this.server.bind(`0.0.0.0:82`, ServerCredentials.createInsecure());
        this.server.start();
    }

    public forceShutdown(): void {
        this.server.forceShutdown();
    }

    private get service() {
        let definition: IProtobufDefinition;

        if (this.protoConfig.package) {
            definition = this.proto[this.protoConfig.package];
        } else {
            definition = this.proto;
        }
        return (<IServiceDefinition>definition[this.protoConfig.service]).service
    }

    private createContext(metadata: Map<string, any>): IContext {
        let token = metadata.get('authorization')[0] || '';
    
        // As a precaution if authorization header starts with Token strip it off
        if (token.indexOf('Token ') === 0) {
          token = token.split('Token ')[1];
        }
    
        return {
          token,
          requestId: metadata.get('request-id')[0],
          user: metadata.get('remoteuser')[0]
        }
      }
}