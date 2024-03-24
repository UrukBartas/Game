import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getNetwork } from '@wagmi/core';
import { Observable } from 'rxjs';

@Injectable()
export class HttpUrukInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const modifiedReq = req.clone({
      setHeaders: {
        chainId: getNetwork().chain.id.toString(),
      },
    });
    return next.handle(modifiedReq);
  }
}
