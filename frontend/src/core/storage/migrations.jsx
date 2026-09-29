// Conserva el saneamiento de correos de las versiones locales anteriores.
export function migrateStoredData(data) {
  let changed = false;
  if (Array.isArray(data?.users)) {
    data.users = data.users.map((user) => {
      if (typeof user?.email === 'string' && /@demo$/i.test(user.email)) {
        changed = true;
        return { ...user, email: user.email.replace(/@demo$/i, '@pulso360.co') };
      }
      return user;
    });
  }
  return { data, changed };
}
