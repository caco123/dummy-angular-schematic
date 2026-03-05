import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, EMPTY, throwError } from 'rxjs';

export const SKIP_ERROR_INTERCEPTOR = new HttpContextToken<boolean>(() => false);

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (req.context.get(SKIP_ERROR_INTERCEPTOR)) {
        console.log(req.url, 'Error was handled in interceptor');
        return EMPTY;
      }

      return throwError(() => new Error(error.message));
    })
  );
};
