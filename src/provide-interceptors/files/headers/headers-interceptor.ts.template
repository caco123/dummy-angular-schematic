import { HttpInterceptorFn } from '@angular/common/http';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const headers = {
    'Authorization': 'Bearer bearer-token',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Date': new Date().toISOString(),
    'X-User-Id': 'dummy-user-id',
    'X-Tenant-Id': 'dummy-tenant-id',
    'user-name': 'Juan',
    'user-role': 'admin',
    'user-email': 'dummy@email.com',
    'user-phone': '123456789',
    'user-address': '123 Main St',
    'user-city': 'New York',
    'user-state': 'NY',
    'user-zip': '12345',
    'user-country': 'USA'
  };
  const clonedReq = req.clone({ setHeaders: headers });
  return next(clonedReq);
};
