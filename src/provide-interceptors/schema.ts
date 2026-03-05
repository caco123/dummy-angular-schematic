export interface Schema {
    interceptors: InterceptorType[];
    project: string;
}

export enum InterceptorType {
    ErrorInterceptor = 'ErrorInterceptor',
    HeadersInterceptor = 'HeadersInterceptor'
}
