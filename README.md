# **Jibber Jabber**

Jibber Jabber is a social platform where users can create posts, join discussions, and interact within topic-based communities. It’s a personal project built to demonstrate full-stack development skills and features rank-based content sorting algorithms, a dynamic and mobile-friendly UI, integration with S3/R2 for image storage, and more.

***
## **DEPLOYMENT**
Jibber Jabber makes use of Docker in order to simplify and containerize deployment. I've included a set of instructions on how to deploy below.
#### PREREQUISITES

- Make sure you have docker installed. See: https://www.docker.com/products/docker-desktop/
- Jibber Jabber requires Cloudflare R2 to store images. To deploy, you'll need to provide some access keys or tokens that allow you to link Jibber Jabber with R2. See: https://developers.cloudflare.com/r2/get-started/
- Jibber Jabber uses email messages for verification codes. This means that the server will need access to an gmail account that you must provide. See: https://support.google.com/accounts/answer/185833?hl=en

#### GENERAL SETUP

Jibber Jabber is deployed into 2 different docker containers: the database, which houses all our data, and the backend server, which not only acts as our API, but also serves the frontend client to anyone who connects.

To get started, we first need to create a docker network. This allows our containers to communicate with one another. In your terminal, use the following command:

```
docker network create <your_network_name>
```

We can then move on to database deployment.

#### DATABASE SETUP

1) Navigate to the "db" directory. Build the image using:

    ```
    docker build -t <your_db_image_name> .
    ```

2) Run the container. Use your previously established network and image name, then provide a name for the container. MYSQL_ROOT_PASSWORD is the password for the root account to access the database.

    ```
    docker run --network <your_network_name> --name <your_db_container_name> -e MYSQL_ROOT_PASSWORD=<your_root_password> <your_db_image_name>
    ```

3) [Optional, Recommended] Create a new database user with all required privledges. I have provided a script (`create-mysql-user.sh`) to do so. These credentials can be used by Jibber API to access the database and is more secure than using root. If running locally for development purposes, you can set your_new_user_host to "%", which means mysql server will accept connections from any IP. Otherwise, use the container name of your server container (which we will setup in the next section) for this field.

    ```
    docker exec -it <your_db_container_name> /scripts/create-mysql-user.sh <your_root_password> <your_new_username> <your_new_user_password> <your_new_user_host>
    ```

4) [Optional, Recommended] If you want a user to be able to access admin tools on the website, you must first make an account (after you finish deployment), then grant that account admin privledges using `grant-admin.sh`, which I have included.

    ```
    docker exec -it <your_db_container_name> /scripts/grant-admin.sh <your_root_password> <your_jibber_account_name>
    ```
If all went well, your database container should be running, and we can now attempt to deploy the server.

#### SERVER SETUP

1) Navigate to the app directory (you should see backend/frontend folders as well as a Dockerfile) and build the docker image using:

    ```
    docker build -t <your_api_image_name> .
    ```

2) To run the container, you need to provide it with a number of required environment variables. They are declared in `/backend/secrets.js`. Below is a description of what each variable entails:

- `MYSQL_DATABASE`: name of the database being connected to. jibber-db is the default. Don't change this unless you also modify the db initilization script.

- `MYSQL_HOST`: the host ip/name of the mysql server. If you followed the previous steps, the value of this variable should be set to <your_db_container_name>, which docker will use to resolve to the correct container.

- `MYSQL_PORT`: port for your mysql server. Default is 3306

- `MYSQL_USER`: the username that you will be using to connect to your MySQL server. If you followed the recommended option of creating a user when you deployed the database, then use the same credentials <your_new_username>. Otherwise, use `root`

- `MYSQL_PASSWORD`: the password that you will be using to connect to your MySQL server. If you followed the recommended option of creating a user when you deployed the database, then use the same credentials <your_new_user_password>. Otherwise, use the root password you provided when deploying the database <your_root_password>

- `EMAIL_DOMAIN`: custom email domain used when sending verification codes. Ie `gmail.com`, `example.dev`, etc.

- `EMAIL_ACCOUNT`: full email address used when sending verification codes. Ie `example@gmail.com`

- `EMAIL_APP_PASSWORD`: app password used to authenticate your email account. (see: https://support.google.com/accounts/answer/185833?hl=en)

- `R2_URL`: base URL of the R2/S3 bucket used to store images

- `R2_BUCKET_NAME`: name of the R2/S3 bucket used to store images

- `R2_ACCESS_KEY`: R2/S3 access key, which is required to use the R2/S3 bucket. Get this from cloudflare/AWS

- `R2_SECRET_ACCESS_KEY`: R2/S3 secret access key, needed to use R2/S3 bucket. Get this from cloudflare/AWS

- `R2_ENDPOINT`: the endpoint URL of your R2/S3 bucket

- `CLOUDFLARE_CACHE_API_TOKEN`: your cloudflare API token which is needed to purge caches (needed to refresh caches that store images). Get this from cloudflare

- `CLOUDFLARE_ZONE_ID`: your cloudflare zone id. Retrieved from cloudflare 

- `SESSION_STORE_SECRET`: required to use sessions. Pick a secure value

- `TRUST_ALL_PROXY`: Might be needed to deploy on certain configurations. Default is false, and should be left that way for local deployment.

    You can provide these values in settings.env, or on the command line (safer). You should also consider using something more secure, such as docker secrets.

    ```
    docker run -p 3000:3000 --name <your_api_container_name> --network <your_network_name> <your_api_image_name> 
    -e MYSQL_HOST=<your_db_container_name>
    -e MYSQL_USER=<your_new_username>
    -e MYSQL_PASSWORD=<your_new_user_password>
    -e EMAIL_DOMAIN=<your_email_domain>
    -e EMAIL_ACCOUNT=<your_email_account>
    -e EMAIL_APP_PASSWORD=<your_email_app_password>
    -e R2_URL=<your_r2_url>
    -e R2_BUCKET_NAME=<your_r2_bucket_name>
    -e R2_ACCESS_KEY=<your_r2_access_key>
    -e R2_SECRET_ACCESS_KEY=<your_r2_secret_access_key>
    -e R2_ENDPOINT=<your_r2_endpoint_url>
    -e CLOUDFLARE_CACHE_API_TOKEN=<your_cloudflare_cache_api_token>
    -e CLOUDFLARE_ZONE_ID=<your_cloudflare_zone_id>
    -e SESSION_STORE_SECRET=<your_new_session_secret>
    ```
    
Wait for docker to finish initalizing, and you should now be able to via http://localhost:3000/

Note: The initial home page should be empty. Create an account, add boards, and posts to see content and features.