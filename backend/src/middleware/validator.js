import { validationResult } from "express-validator";
import { ValidationError } from "./errorHandler.js";

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      }));

      const errorMessage = formattedErrors
        .map((e) => `${e.field}: ${e.message}`)
        .join("; ");
      throw new ValidationError(errorMessage);
    }

    next();
  };
};

export { validate };
