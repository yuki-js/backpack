import { insertNotification } from "@coral-xyz/backend-common";
import { NOTIFICATION_ADD } from "@coral-xyz/common";
import type { GraphQLResolveInfo } from "graphql";

import { setFriendship } from "../../../../db/friendships";
import { Redis } from "../../../../Redis";
import type { ApiContext } from "../../context";
import type {
  MutationResolvers,
  MutationSendFriendRequestArgs,
} from "../../types";

/**
 * Handler for the mutation to allow user's to send other users friend requests.
 * @param {{}} _parent
 * @param {MutationSendFriendRequestArgs} args
 * @param {ApiContext} ctx
 * @param {GraphQLResolveInfo} _info
 * FIXME:TODO: move to new hasura client abstraction
 */
export const sendFriendRequestMutation: MutationResolvers["sendFriendRequest"] =
  async (
    _parent: {},
    { accept, otherUserId }: MutationSendFriendRequestArgs,
    ctx: ApiContext,
    _info: GraphQLResolveInfo
  ): Promise<boolean | null> => {
    const areFriends = await setFriendship({
      from: ctx.authorization.userId!,
      to: otherUserId,
      sendRequest: accept,
    });

    if (accept) {
      if (areFriends) {
        const notification = await insertNotification(
          "friend_requests_accept",
          otherUserId,
          {
            title: "Friend request accepted",
            body: JSON.stringify({ from: ctx.authorization.userId }),
          }
        );

        await Redis.getInstance().send(
          JSON.stringify({
            type: "friend_request_accept",
            payload: {
              from: ctx.authorization.userId,
              to: otherUserId,
            },
          })
        );

        await Redis.getInstance().publish(`INDIVIDUAL_${otherUserId}`, {
          type: NOTIFICATION_ADD,
          payload: notification,
        });
      } else {
        const notificationData = await insertNotification(
          "friend_requests",
          otherUserId,
          {
            title: "Friend request",
            body: JSON.stringify({
              from: ctx.authorization.userId,
            }),
          }
        );

        await Redis.getInstance().send(
          JSON.stringify({
            type: "friend_request",
            payload: {
              from: ctx.authorization.userId,
              to: otherUserId,
            },
          })
        );

        await Redis.getInstance().publish(`INDIVIDUAL_${otherUserId}`, {
          type: NOTIFICATION_ADD,
          payload: notificationData,
        });
      }
    }

    return areFriends ?? null;
  };