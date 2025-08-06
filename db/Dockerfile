FROM mysql:8.4


ENV MYSQL_HOST=127.0.0.1
ENV MYSQL_PORT=3306
ENV MYSQL_DATABASE=jibber-db

COPY my.cnf /etc/mysql/my.cnf

#Add script to grant admin perms to defined user
COPY grant-admin.sh /scripts/grant-admin.sh
RUN chmod +x /scripts/grant-admin.sh

#Script to create user
COPY create-mysql-user.sh /scripts/create-mysql-user.sh
RUN chmod +x /scripts/create-mysql-user.sh

#SQL init script
COPY ./init.sql /docker-entrypoint-initdb.d/01-init.sql

# Expose MySQL port
EXPOSE 3306

# Start MySQL
CMD ["mysqld"]