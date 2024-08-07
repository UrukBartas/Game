import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getNetwork } from '@wagmi/core';
import { Observable, catchError, throwError } from 'rxjs';
@Injectable()
export class HttpUrukInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let request = req.clone();
    try {
      if (!!request.withCredentials && !!getNetwork() && !!getNetwork().chain) {
        try {
          request = req.clone({
            setHeaders: {
              chainId: getNetwork().chain.id.toString(),
            },
          });
        } catch (error) {
          console.error(error);
        }
      }
    } catch (error) {
      console.error(error);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error HTTP:', error);
        return throwError(() => error);
      })
    );
  }
}
