# Server Environment Configuration

## Create a `.env` File

1. In the server folder, create a `.env` file.

2. Add the following content to the `.env` file:

    ```env
    MONGO_STRING=mongodb+srv://<username>:<password>@cluster0.ltfrycb.mongodb.net/Chat-App?retryWrites=true&w=majority
    PORT= #your-port
    SECRET_KEY= #your-secret-key
    ```

3. Replace `<username>` and `<password>` with your MongoDB credentials.
