import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { getNetwork } from '@wagmi/core';
import { Observable, catchError, from, mergeMap, throwError } from 'rxjs';
export const AUTH_TOKEN_KEY = 'auth_token';
@Injectable()
export class HttpUrukInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clonamos la solicitud para agregar o modificar los encabezados
    let request = req.clone();

    return from(Preferences.get({ key: AUTH_TOKEN_KEY })).pipe(
      mergeMap((token) => {
        try {
          // Si existe el token, agregar el encabezado Authorization
          const value = token.value;
          if (value) {
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${value}`,
              },
            });
          }

          // Lógica para agregar el chainId si withCredentials es true
          if (
            !!request.withCredentials &&
            !!getNetwork() &&
            !!getNetwork().chain
          ) {
            try {
              request = request.clone({
                setHeaders: {
                  chainId: getNetwork().chain.id.toString(),
                },
              });
            } catch (error) {
              console.error('Error configurando chainId:', error);
            }
          }
        } catch (error) {
          console.error('Error procesando la solicitud:', error);
        }

        // Continuar con la solicitud modificada
        return next.handle(request);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error HTTP:', error);
        return throwError(() => error);
      })
    );
  }
}
