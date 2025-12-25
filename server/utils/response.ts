import type { H3Event, EventHandlerRequest } from "h3";

export enum HttpCode {
  StatusContinue = 100,
  StatusSwitchingProtocols = 101,
  StatusProcessing = 102,
  StatusEarlyHints = 103,

  StatusOK = 200,
  StatusCreated = 201,
  StatusAccepted = 202,
  StatusNonAuthoritativeInfo = 203,
  StatusNoContent = 204,
  StatusResetContent = 205,
  StatusPartialContent = 206,
  StatusMultiStatus = 207,
  StatusAlreadyReported = 208,
  StatusIMUsed = 226,

  StatusMultipleChoices = 300,
  StatusMovedPermanently = 301,
  StatusFound = 302,
  StatusSeeOther = 303,
  StatusNotModified = 304,
  StatusUseProxy = 305,
  StatusTemporaryRedirect = 307,
  StatusPermanentRedirect = 308,

  StatusBadRequest = 400,
  StatusUnauthorized = 401,
  StatusPaymentRequired = 402,
  StatusForbidden = 403,
  StatusNotFound = 404,
  StatusMethodNotAllowed = 405,
  StatusNotAcceptable = 406,
  StatusProxyAuthRequired = 407,
  StatusRequestTimeout = 408,
  StatusConflict = 409,
  StatusGone = 410,
  StatusLengthRequired = 411,
  StatusPreconditionFailed = 412,
  StatusRequestEntityTooLarge = 413,
  StatusRequestURITooLong = 414,
  StatusUnsupportedMediaType = 415,
  StatusRequestedRangeNotSatisfiable = 416,
  StatusExpectationFailed = 417,
  StatusTeapot = 418,
  StatusMisdirectedRequest = 421,
  StatusUnprocessableEntity = 422,
  StatusLocked = 423,
  StatusFailedDependency = 424,
  StatusTooEarly = 425,
  StatusUpgradeRequired = 426,
  StatusPreconditionRequired = 428,
  StatusTooManyRequests = 429,
  StatusRequestHeaderFieldsTooLarge = 431,
  StatusUnavailableForLegalReasons = 451,

  StatusInternalServerError = 500,
  StatusNotImplemented = 501,
  StatusBadGateway = 502,
  StatusServiceUnavailable = 503,
  StatusGatewayTimeout = 504,
  StatusHTTPVersionNotSupported = 505,
  StatusVariantAlsoNegotiates = 506,
  StatusInsufficientStorage = 507,
  StatusLoopDetected = 508,
  StatusNotExtended = 510,
  StatusNetworkAuthenticationRequired = 511,
}

export function statusText(code: number): string {
  switch (code) {
    case HttpCode.StatusContinue:
      return "Continue";
    case HttpCode.StatusSwitchingProtocols:
      return "Switching Protocols";
    case HttpCode.StatusProcessing:
      return "Processing";
    case HttpCode.StatusEarlyHints:
      return "Early Hints";
    case HttpCode.StatusOK:
      return "OK";
    case HttpCode.StatusCreated:
      return "Created";
    case HttpCode.StatusAccepted:
      return "Accepted";
    case HttpCode.StatusNonAuthoritativeInfo:
      return "Non-Authoritative Information";
    case HttpCode.StatusNoContent:
      return "No Content";
    case HttpCode.StatusResetContent:
      return "Reset Content";
    case HttpCode.StatusPartialContent:
      return "Partial Content";
    case HttpCode.StatusMultiStatus:
      return "Multi-Status";
    case HttpCode.StatusAlreadyReported:
      return "Already Reported";
    case HttpCode.StatusIMUsed:
      return "IM Used";
    case HttpCode.StatusMultipleChoices:
      return "Multiple Choices";
    case HttpCode.StatusMovedPermanently:
      return "Moved Permanently";
    case HttpCode.StatusFound:
      return "Found";
    case HttpCode.StatusSeeOther:
      return "See Other";
    case HttpCode.StatusNotModified:
      return "Not Modified";
    case HttpCode.StatusUseProxy:
      return "Use Proxy";
    case HttpCode.StatusTemporaryRedirect:
      return "Temporary Redirect";
    case HttpCode.StatusPermanentRedirect:
      return "Permanent Redirect";
    case HttpCode.StatusBadRequest:
      return "Bad Request";
    case HttpCode.StatusUnauthorized:
      return "Unauthorized";
    case HttpCode.StatusPaymentRequired:
      return "Payment Required";
    case HttpCode.StatusForbidden:
      return "Forbidden";
    case HttpCode.StatusNotFound:
      return "Not Found";
    case HttpCode.StatusMethodNotAllowed:
      return "Method Not Allowed";
    case HttpCode.StatusNotAcceptable:
      return "Not Acceptable";
    case HttpCode.StatusProxyAuthRequired:
      return "Proxy Authentication Required";
    case HttpCode.StatusRequestTimeout:
      return "Request Timeout";
    case HttpCode.StatusConflict:
      return "Conflict";
    case HttpCode.StatusGone:
      return "Gone";
    case HttpCode.StatusLengthRequired:
      return "Length Required";
    case HttpCode.StatusPreconditionFailed:
      return "Precondition Failed";
    case HttpCode.StatusRequestEntityTooLarge:
      return "Request Entity Too Large";
    case HttpCode.StatusRequestURITooLong:
      return "Request URI Too Long";
    case HttpCode.StatusUnsupportedMediaType:
      return "Unsupported Media Type";
    case HttpCode.StatusRequestedRangeNotSatisfiable:
      return "Requested Range Not Satisfiable";
    case HttpCode.StatusExpectationFailed:
      return "Expectation Failed";
    case HttpCode.StatusTeapot:
      return "I'm a teapot";
    case HttpCode.StatusMisdirectedRequest:
      return "Misdirected Request";
    case HttpCode.StatusUnprocessableEntity:
      return "Unprocessable Entity";
    case HttpCode.StatusLocked:
      return "Locked";
    case HttpCode.StatusFailedDependency:
      return "Failed Dependency";
    case HttpCode.StatusTooEarly:
      return "Too Early";
    case HttpCode.StatusUpgradeRequired:
      return "Upgrade Required";
    case HttpCode.StatusPreconditionRequired:
      return "Precondition Required";
    case HttpCode.StatusTooManyRequests:
      return "Too Many Requests";
    case HttpCode.StatusRequestHeaderFieldsTooLarge:
      return "Request Header Fields Too Large";
    case HttpCode.StatusUnavailableForLegalReasons:
      return "Unavailable For Legal Reasons";
    case HttpCode.StatusInternalServerError:
      return "Internal Server Error";
    case HttpCode.StatusNotImplemented:
      return "Not Implemented";
    case HttpCode.StatusBadGateway:
      return "Bad Gateway";
    case HttpCode.StatusServiceUnavailable:
      return "Service Unavailable";
    case HttpCode.StatusGatewayTimeout:
      return "Gateway Timeout";
    case HttpCode.StatusHTTPVersionNotSupported:
      return "HTTP Version Not Supported";
    case HttpCode.StatusVariantAlsoNegotiates:
      return "Variant Also Negotiates";
    case HttpCode.StatusInsufficientStorage:
      return "Insufficient Storage";
    case HttpCode.StatusLoopDetected:
      return "Loop Detected";
    case HttpCode.StatusNotExtended:
      return "Not Extended";
    case HttpCode.StatusNetworkAuthenticationRequired:
      return "Network Authentication Required";
    default:
      return "";
  }
}

export interface ResponseData {
  statusCode?: number;
  message?: string;
  data?: any;
}

export function getResponse<T>(
  event: H3Event<EventHandlerRequest>,
  httpCode?: HttpCode,
  data?: T
): T | void {
  if (httpCode) event.node.res.statusCode = httpCode;
  return data;
}

export function getOKResponse<T>(
  event: H3Event<EventHandlerRequest>,
  data?: T
): T | Record<string, any> {
  event.node.res.statusCode = HttpCode.StatusOK;
  if (data === undefined) {
    return { message: statusText(HttpCode.StatusOK) };
  }
  return data;
}

export function getBadResponse(
  event: H3Event<EventHandlerRequest>,
  message?: string
): ResponseData | void {
  event.node.res.statusCode = HttpCode.StatusBadRequest;
  return {
    message: message ?? statusText(HttpCode.StatusBadRequest),
  };
}

export function getNotAuthResponse(
  event: H3Event<EventHandlerRequest>,
  message?: string
): ResponseData | void {
  event.node.res.statusCode = HttpCode.StatusUnauthorized;
  return {
    message: message ?? statusText(HttpCode.StatusUnauthorized),
  };
}

export function getNotFoundResponse(
  event: H3Event<EventHandlerRequest>,
  message?: string
): ResponseData | void {
  event.node.res.statusCode = HttpCode.StatusNotFound;
  return {
    message: message ?? statusText(HttpCode.StatusNotFound),
  };
}

export function getForbiddenResponse(
  event: H3Event<EventHandlerRequest>,
  message?: string
): ResponseData | void {
  event.node.res.statusCode = HttpCode.StatusForbidden;
  return {
    message: message ?? statusText(HttpCode.StatusForbidden),
  };
}
