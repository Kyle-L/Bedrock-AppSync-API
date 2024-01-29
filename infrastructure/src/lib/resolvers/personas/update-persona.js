import { util } from '@aws-appsync/utils';

/**
 * Puts an item into the DynamoDB table using an auto-generated ID.
 */
export function request(ctx) {
  return {
    operation: 'UpdateItem',
    key: util.dynamodb.toMapValues({
      pk: `PERSONA`,
      sk: `PERSONA#${ctx.arguments.input.personaId}`
    }),
    update: {
      expression:
        'SET #name = :name, #avatar = :avatar, #prompt = :prompt, #subtitle = :subtitle, #description = :description, #color = :color, #model = :model, #knowledgeBaseId = :knowledgeBaseId, #voice = :voice, #status = :status, #createdAt = :createdAt, #persona = :persona, #messages = :messages, #updatedAt = :updatedAt',
      expressionNames: {
        '#name': 'name',
        '#avatar': 'avatar',
        '#prompt': 'prompt',
        '#subtitle': 'subtitle',
        '#description': 'description',
        '#color': 'color',
        '#model': 'model',
        '#knowledgeBaseId': 'knowledgeBaseId',
        '#voice': 'voice',
        '#updatedAt': 'updatedAt'
      },
      expressionValues: {
        ':name': { S: ctx.args.input.name },
        ':avatar': { S: ctx.args.input.avatar ?? null },
        ':prompt': { S: ctx.args.input.prompt ?? null },
        ':subtitle': { S: ctx.args.input.subtitle ?? null },
        ':description': { S: ctx.args.input.description ?? null },
        ':color': { S: ctx.args.input.color ?? null },
        ':model': { S: ctx.args.input.model ?? null },
        ':knowledgeBaseId': { S: ctx.args.input.knowledgeBaseId ?? null },
        ':voice': {
          M: util.dynamodb.toMapValues({
            name: ctx.args.input.voiceName,
            style: ctx.args.input.voiceStyle
          })
        },
        ':updatedAt': { S: `${util.time.nowISO8601()}` }
      }
    }
  };
}

/**
 * Returns the item or throws an error if the operation failed
 */
export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  return {
    persona: {
      personaId: ctx.result.sk.split('#')[1],
      pk: undefined,
      sk: undefined,
      ...ctx.result
    }
  };
}
