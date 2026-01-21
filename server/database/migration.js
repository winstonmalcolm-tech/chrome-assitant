import { exec } from "child_process";
import path from "path";

function migrateDatabase() {
  // 1. Database credentials
  const host = "localhost";
  const user = "root";
  const password = "root";
  const database = "assistant_db";

  // 2. SQL file location
  const sqlFile = "./backup.sql";
  const sqlFilePath = path.resolve(sqlFile);

  // 3. Build MySQL command
  const command =
    "mysql -h " +
    host +
    " -u " +
    user +
    " -p" +
    password +
    " " +
    database +
    ' < "' +
    sqlFilePath +
    '"';

  // 4. Run command
  exec(command, function (error, stdout, stderr) {
    if (error) {
      console.error("Migration failed");
      console.error(stderr);
      return;
    }

    console.log("Migration successful");
  });
}

migrateDatabase();
