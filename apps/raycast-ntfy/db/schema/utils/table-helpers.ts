import { customType, sqliteTableCreator } from 'drizzle-orm/sqlite-core';

export const table = sqliteTableCreator((name) => `ntfy_${name}`);

export const url = customType<{ data: URL; driverData: string }>({
  dataType() {
    return 'TEXT';
  },
  toDriver(value) {
    return value.toString();
  },
  fromDriver(value) {
    return new URL(value);
  },
});
