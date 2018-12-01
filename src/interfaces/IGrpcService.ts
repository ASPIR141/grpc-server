import { ServiceHandlerFunction } from './ServiceHandlerFunction';

export interface IGrpcService {
    grpcMethod: string;
    handler: ServiceHandlerFunction<any>;
}