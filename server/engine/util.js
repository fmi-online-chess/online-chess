/**
 * Convert Express middleware to SocketIO middleware
 * @param {(req, res, next) => {}} middleware Express middleware to wrap as SocketIO middleware
 * @returns 
 */
export function ioWrap(middleware) {
    return (socket, next) => middleware(socket.request, {}, next);
}