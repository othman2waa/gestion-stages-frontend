import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Skip error handling for login endpoint
      if (req.url.includes('/auth/login')) {
        return throwError(() => error);
      }

      let message: string;

      switch (error.status) {
        case 0:
          message = 'Erreur réseau — vérifiez votre connexion';
          break;
        case 401:
          message = 'Session expirée — veuillez vous reconnecter';
          router.navigate(['/login']);
          break;
        case 403:
          message = 'Accès refusé — permissions insuffisantes';
          break;
        case 404:
          message = 'Ressource introuvable';
          break;
        case 409:
          message = 'Conflit — données déjà existantes';
          break;
        case 500:
          message = 'Erreur serveur — réessayez plus tard';
          break;
        default:
          message = 'Erreur inattendue';
          break;
      }

      snackBar.open(message, 'Fermer', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-error']
      });

      return throwError(() => error);
    })
  );
};
