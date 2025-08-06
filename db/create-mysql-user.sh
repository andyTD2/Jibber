#!/bin/bash
set -e

# Usage check
if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <root_password> <new_user> <new_user_password> <new_user_host>"
  exit 1
fi

# Ensure required environment variables are set
if [ -z "$MYSQL_DATABASE" ]; then
    echo "MYSQL_DATABASE variable not found. Ensure MYSQL_DATABASE environment variable is set."
    exit 1
fi

# Assign arguments to variables
ROOT_PASSWORD="$1"
NEW_USER="$2"
NEW_USER_PASSWORD="$3"
NEW_USER_HOST="$4"


mysql --user=root --password="$ROOT_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS '$NEW_USER'@'$NEW_USER_HOST' IDENTIFIED BY '$NEW_USER_PASSWORD';

REVOKE ALL PRIVILEGES, GRANT OPTION FROM '$NEW_USER'@'$NEW_USER_HOST';

GRANT CREATE, SELECT, INSERT, UPDATE, DELETE ON \`$MYSQL_DATABASE\`.* TO '$NEW_USER'@'$NEW_USER_HOST';

GRANT EXECUTE ON \`$MYSQL_DATABASE\`.* TO '$NEW_USER'@'$NEW_USER_HOST';

FLUSH PRIVILEGES;
EOF