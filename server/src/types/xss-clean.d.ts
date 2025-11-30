// Type declaration for xss-clean module
declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  
  function xssClean(): RequestHandler;
  
  export = xssClean;
}
