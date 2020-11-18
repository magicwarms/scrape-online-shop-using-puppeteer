import "dotenv/config";
import cluster from "cluster";
import os from "os";
import startServer from "./start-server";

const numCPUS = os.cpus().length;
const port = parseInt(process.env.PORT);

function startServerCluster() {
    console.info("Production/Staging server mode started!");
    // Aktifkan jika mode production
    if (cluster.isMaster) {
        for (let i = 0; i < numCPUS; i += 1) {
            cluster.fork();
        }
    } else {
        startServer({ port: port })
            .then()
            .catch((err) => console.error(err));
    }
}

function startServerDevelopment() {
    console.info("Development server mode started!");
    // activate if development mode
    startServer({ port: port })
        .then()
        .catch((err) => console.error(err));
}

if (process.env.APP_ENV === "development") {
    startServerDevelopment();
} else {
    startServerCluster();
}
