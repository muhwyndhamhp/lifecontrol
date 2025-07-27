import { DurableObjectStorage } from '@cloudflare/workers-types';
import { ValidationCache } from '../schemas/database';
import { ContextfulUserFromToken, UserFromToken } from '../middlewares/types';

export async function CacheVerified(
  storage: DurableObjectStorage,
  access: string,
  refresh: string,
  user: UserFromToken
) {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 2);

  storage.sql.exec(
    `insert into "validation_cache" 
      (access, refresh, user_id, oauth_id, email, expiry_timestamp) 
      values(
        "${access}", 
        "${refresh}", 
        ${parseInt(user.properties.userID)}, 
        "${user.properties.oauthID}", 
        "${user.properties.email}", 
        ${expiryDate.getTime() / 1000}
      )`
  );

  await storage.setAlarm(expiryDate);
}

export function RemoveCache(storage: DurableObjectStorage) {
  storage.sql.exec<ValidationCache>(
    `delete from "validation_cache" where expiry_timestamp <= ${new Date().getTime() / 1000}`
  );
}

export async function GetVerified(
  storage: DurableObjectStorage,
  access: string
) {
  const res = storage.sql
    .exec<ValidationCache>(
      `select * from "validation_cache" where access = "${access}" limit 1`
    )
    .toArray();

  if (!res || res.length === 0) {
    return {
      access: '',
      refresh: '',
    } as ContextfulUserFromToken;
  }

  return {
    access: res[0].access,
    refresh: res[0].refresh,
    user: {
      type: 'user',
      properties: {
        userID: res[0].user_id.toString(),
        oauthID: res[0].oauth_id,
        email: res[0].email,
      },
    },
  } as ContextfulUserFromToken;
}
