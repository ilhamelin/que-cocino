// Server identity is removed only after reauthentication and successful remote cleanup.
// Cancellation is not deletion; local data is retired only after confirmed identity deletion.
export async function deleteVerifiedAccount(uid: string, dependencies: {
  verifyAndDelete: (beforeDelete: (verifiedUid: string) => Promise<void>) => Promise<boolean>;
  prepare: (uid: string) => Promise<void>;
  finish: (uid: string) => Promise<void>;
}): Promise<boolean> {
  const deleted = await dependencies.verifyAndDelete(async verifiedUid => {
    if (verifiedUid !== uid) throw Object.assign(new Error('Cuenta distinta.'), { code: 'auth/user-mismatch' });
    await dependencies.prepare(uid);
  });
  if (deleted) await dependencies.finish(uid);
  return deleted;
}
