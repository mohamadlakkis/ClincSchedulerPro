FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=123
ENV MYSQL_DATABASE=430_db

# Copy the schema initialization to the Docker container (it will automatically be queried!)
COPY init.sql /docker-entrypoint-initdb.d/

# MySQL Port
EXPOSE 3306 
