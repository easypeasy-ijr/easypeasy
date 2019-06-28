import { createApp } from "./config/app";

(async () => {

    const app = await createApp();
    const PORT = process.env.PORT;

    // Start the server
    app.listen(PORT, () => {
        console.log(
            `The server is running in port ${PORT}!`
        );
    });

})();
