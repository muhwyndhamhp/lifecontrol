import { createClient } from '@openauthjs/openauth/client';
import { email, object, optional, pipe, string } from 'valibot';
import { createSubjects } from '@openauthjs/openauth/subject';

export const subjects = createSubjects({
  user: object({
    userID: string(),
    email: pipe(string(), email()),
    oauthID: optional(string()),
  }),
});

export const authClient = (url: string) =>
  createClient({
    clientID: 'life-control',
    issuer: url,
  });

