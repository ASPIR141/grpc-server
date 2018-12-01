import { IContext } from './IContext';
import { IServiceResponse } from './IServiceResponse';

export type ServiceHandlerFunction<T = any> = (context: IContext, request: any) => Promise<IServiceResponse<T>>;