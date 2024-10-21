
const ApiKeyVerification = (req, res, next) => {
    try {
        const { apiKey } = req.query
        if (!apiKey || apiKey == "" || apiKey == null || typeof apiKey == undefined) {
            throw "Api key not found "
        }


        if (apiKey == [process.env.APIKEY]) {
            next();
        }
        else {
            throw "Invalid Api Key"
        }

    } catch (e) {
        console.log(e);
        return res.status(400).json({ success: false, message: e });
    }

}

module.exports = {
    ApiKeyVerification
}
