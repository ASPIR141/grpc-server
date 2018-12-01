export interface IServiceResponse<T = any> {
    status?: number;
    content?: T;
    headers?: {
        [key: string]: string | Array<string>;
    };
}