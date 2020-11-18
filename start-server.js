import express from "express";
import router from "./route/Routes";
// set timezone
process.env.TZ = "Asia/Jakarta";

const currentTime = new Date(Date.now()).toTimeString();

// ensures we close the server in the event of an error.
function setupCloseOnExit(server) {
    async function exitHandler(options = {}) {
        await server
            .close()
            .then(() => {
                console.info(`Server successfully closed at ${currentTime}`);
            })
            .catch((e) => {
                console.warn(`Something went wrong closing the server at ${currentTime}`, e.stack);
            });

        if (options.exit) {
            if (options.exit) {
                // process.exit();
                throw new Error(`Exit process.exit Node JS at ${currentTime}`);
            }
        }
    }

    // do something when app is closing
    process.on("exit", exitHandler);
    // catches ctrl+c event
    process.on("SIGINT", exitHandler.bind(null, { exit: true }));
    // catches "kill pid" (for example: nodemon restart)
    process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
    process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));
    // catches uncaught exceptions
    process.on("uncaughtException", (err) => {
        console.error("Caught exception: ", err);
    });
}

function startServer({ port = process.env.PORT } = {}) {
    const app = express();
    // Enable if your Express JS behind Reverse Proxy
    // app.set("trust proxy", 1);
    // I mount my entire app to the /api route (or you could just do "/" if you want)
    // Use rate limiter and speed limiter for prevent brute force and spamming attacks
    app.use("/api", router);
    // handle 404
    app.use(function (_req, res, _next) {
        return res.status(404).json({
            success: false,
            data: {},
            message: "API route not found",
        });
    });
    // handle 500 Any error
    app.use(function (err, _req, res, _next) {
        console.error(err);
        return res.status(500).json({
            success: false,
            data: {
                error: err.message,
            },
            message: `Error! (${err.message})`,
        });
    });
    // I prefer dealing with promises. It makes testing easier, among other things.
    // So this block of code allows me to start the express app and resolve the
    // promise with the express server
    return new Promise((resolve) => {
        const server = app.listen(port, () => {
            console.info(`Listening on port ${port} at ${currentTime}`);
            // this block of code turns `server.close` into a promise API
            const originalClose = server.close.bind(server);
            server.close = () => {
                return new Promise((resolveClose) => {
                    originalClose(resolveClose);
                });
            };
            // this ensures that we properly close the server when the program exists
            setupCloseOnExit(server);
            // resolve the whole promise with the express server
            resolve(server);
        });
    });
}

export default startServer;
