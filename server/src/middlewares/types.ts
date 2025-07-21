
export type UserFromToken = {
  type: 'user';
  properties: {
    userID: string;
    email: string;
    oauthID?: string | undefined;
  };
};

export type ContextfulUserFromToken = {
  access: string;
  refresh: string;
  user?: UserFromToken;
};
