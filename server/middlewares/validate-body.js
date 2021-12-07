export default (validator) => async (req, res, next) => {
    let error = null;

    Object
        .keys(validator)
        .forEach((key) => {
            if (!validator[key](req.body[key])) {
                error = true;
            }
        });

    if (error) {
        return res.status(400).json({
            message: "Bad request!"
        });
    }

    await next();
};