interface Res {
  status: (arg0: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (): any;
    json: {
      (arg0: { errors?: string | undefined; message: string }): void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (): any;
    };
  };
}
interface Err {
  stack: string;
  message: string;
  status: number;
  errors: { [x: string]: { message: string } };
}
exports.catchErrors = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (arg0: number, arg1: Res, arg2: () => void) => Promise<any>
) =>
  function catchAllErrors(req: number, res: Res, next: () => void) {
    fn(req, res, next).catch((err: string) => {
      if (typeof err === 'string') {
        res.status(400).json({
          message: err,
        });
      } else {
        // eslint-disable-next-line promise/no-callback-in-promise
        next();
      }
    });
  };

exports.mongoseErrors = function handlerMongooseErrors(
  err: Err,
  res: Res,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  next: (arg0: Err) => any
) {
  if (!err.errors) {
    return next(err);
  }

  const errorKeys = Object.keys(err.errors);
  let message = '';
  // eslint-disable-next-line no-return-assign
  errorKeys.forEach((key) => (message += `${err.errors[key].message}, `));

  message = message.substr(0, message.length - 2);

  return res.status(400).json({
    message,
  });
};

exports.developmentErrors = function handlerDevelopmentErrors(
  err: Err,
  res: Res
) {
  // eslint-disable-next-line no-param-reassign
  err.stack = err.stack || '';
  const errorDetails = {
    message: err.message,
    status: err.status,
    stack: err.stack,
  };

  res.status(err.status || 500).json(errorDetails);
};

exports.productionErrors = function handlerProductionErrors(
  err: Err,
  res: Res
) {
  res.status(err.status || 500).json({
    message: 'Internal Server Error',
  });
};

exports.notFound = function handlerNotFound(res: Res) {
  res.status(404).json({
    message: 'Route not found',
  });
};
