import { sql } from 'drizzle-orm';
import { hostname } from 'os';
import { db$, DrizzleDB } from '../db';
import { NewServer, NewTopic, serversTable, topicsTable } from '../db/schema';

export async function seed(db: DrizzleDB, servers?: NewServer[], topics?: NewTopic[]) {
  await db.transaction(async (tx) => {
    const serversToAdd = servers ?? [
      {
        name: 'Ntfy',
        description: 'Default Server',
        url: new URL('https://ntfy.sh/'),
      },
    ];
    const [{ id: serverId }] = await tx
      .insert(serversTable)
      .values(serversToAdd)
      .onConflictDoUpdate({
        target: [serversTable.id],
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          url: sql`excluded.url`,
        },
      })
      .returning({ id: serversTable.id });

    const topicsToAdd = topics ?? [
      {
        topic: hostname(),
        description: 'Default Topic',
        serverId,
      },
    ];

    await tx
      .insert(topicsTable)
      .values(topicsToAdd)
      .onConflictDoUpdate({
        target: [topicsTable.id],
        set: {
          topic: sql`excluded.topic`,
          description: sql`excluded.description`,
          serverId: sql`excluded.server_id`,
        },
      });
  });
}

if (require.main === module) {
  db$.then((db) =>
    seed(db)
      .then(() => console.info('✅ Database seeded successfully! 🌱'))
      .catch((err) => {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
      }),
  );
}
