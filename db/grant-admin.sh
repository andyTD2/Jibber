#!/bin/bash

# Check if username is provided
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <root_password> <username>"
    exit 1
fi

# Ensure required environment variables are set
if [ -z "$MYSQL_DATABASE" ]; then
    echo "MYSQL_DATABASE variable not found. Ensure MYSQL_DATABASE environment variable is set."
    exit 1
fi

ROOT_PASSWORD=$1
USERNAME=$2

# Run the SQL command to insert the permission for the user
mysql -u root -p"$ROOT_PASSWORD" -D "$MYSQL_DATABASE" -e \
"INSERT INTO userpermissions (userId, permission)
VALUES ((SELECT id FROM users WHERE username='$USERNAME'), 'SITE_ADMIN');"

# Check if the command was successful
if [ $? -eq 0 ]; then
    echo "SITE_ADMIN permission granted to user '$USERNAME'"
else
    echo "Error: Failed to insert permission for user '$USERNAME'"
    exit 1
fi
