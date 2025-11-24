import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Ngrok Interceptor
 * Adds ngrok-skip-browser-warning header to bypass ngrok's browser warning page
 * This is needed when using ngrok for local development
 *
 * @param req - HTTP request
 * @param next - HTTP handler
 * @returns Observable with HTTP event
 */
export const ngrokInterceptor: HttpInterceptorFn = (req, next) => {

  const isNgrokUrl = req.url.includes('ngrok') || req.url.includes('ngrok-free.app');

  if (isNgrokUrl) {
    // Clone the request and add the ngrok bypass header
    const clonedReq = req.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    return next(clonedReq);
  }

  return next(req);
};

