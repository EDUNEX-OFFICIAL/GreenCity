# How to Reset Databases Without Scripts

Here are three ways to drop and recreate your databases without using a custom JavaScript file.

## Option 1: Using Docker (Fastest CLI Method)
Since your database is running in a Docker container, you can use the `psql` command *inside* that container. You don't need `psql` installed on your Windows machine.

1.  **Enter the Docker Container**:
    Run this command in your terminal (PowerShell or CMD):
    ```powershell
    docker exec -it greencity_db_container psql -U postgres
    ```

2.  **Execute SQL Commands**:
    Once you are inside the `postgres=#` prompt, type:
    ```sql
    DROP DATABASE IF EXISTS "greenCity";
    DROP DATABASE IF EXISTS "superUsers";
    DROP DATABASE IF EXISTS "db_greencity";
    DROP DATABASE IF EXISTS "db_master";
    
    CREATE DATABASE "db_greencity";
    CREATE DATABASE "db_master";
    \q
    ```

## Option 2: Using Prisma (The "Developer" Way)
Prisma has a built-in command `migrate reset` that drops the database, recreates it, and runs all migrations. Since you have two schema files, you run it once for each.

1.  **Navigate to backend**:
    ```powershell
    cd apps/backend
    ```

2.  **Reset `db_greencity`**:
    ```powershell
    npx prisma migrate reset --schema=prisma/schema.prisma
    ```
    *Confirm with 'y' if asked.*

3.  **Reset `db_master`**:
    ```powershell
    npx prisma migrate reset --schema=prisma/superuser.prisma
    ```

## Option 3: Using a GUI (PgAdmin or DBeaver)
If you prefer a visual interface:

1.  **Connect**: Open PgAdmin/DBeaver and connect to `localhost:5432` (User: `postgres`, Password: `Pass@postgresql123`).
2.  **Delete**: In the sidebar, right-click the database (e.g., `greenCity`) and select **Delete/Drop**.
3.  **Create**: Right-click on "Databases", select **Create -> Database**, and name it `db_greencity`.
4.  **Repeat** for `db_master`.
