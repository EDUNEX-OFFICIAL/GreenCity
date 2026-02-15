import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  // Prisma CLI will be told which schema to use via --schema
  // Datasource MUST come from env at runtime
});