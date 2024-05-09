db.createUser({
  user: "dev_user",
  pwd: "dev_password",
  roles: [
    {
      role: "readWrite",
      db: "dev_database",
    },
  ],
});

db.counts.insert({ current: 0 });
