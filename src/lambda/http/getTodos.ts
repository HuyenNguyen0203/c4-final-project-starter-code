import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {
  getTodosForUser,
  getTodosWithPagination
} from '../../businessLogic/todos'
import { getUserId } from '../utils'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    try {
      const nextKey = parseNextKeyParameter(event)
      const limit = parseLimitParameter(event)

      if (!limit) {
        const items = await getTodosForUser(userId)
        return {
          statusCode: 200,
          body: JSON.stringify({
            items
          })
        }
      } else {
        const todoItemsWithPagination = await getTodosWithPagination(
          userId,
          nextKey,
          limit
        )
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            items: todoItemsWithPagination.Items,
            nextKey: encodeNextKey(todoItemsWithPagination.LastEvaluatedKey)
          })
        }
      }
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid Parameters'
        })
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)

// Get value of limit parameter
export function parseLimitParameter(event: APIGatewayProxyEvent) {
  const limitStr = getQueryParameter(event, 'limit')
  if (!limitStr) {
    return undefined
  }

  const limit = parseInt(limitStr, 10)
  if (limit <= 0) {
    throw new Error('Limit should be positive')
  }
  return limit
}

// Get value of limit parameter
export function parseNextKeyParameter(event: APIGatewayProxyEvent) {
  const nextKeyStr = getQueryParameter(event, 'nextKey')
  if (!nextKeyStr) {
    return undefined
  }

  const uriDecoded = decodeURIComponent(nextKeyStr)
  return JSON.parse(uriDecoded)
}

// Get a query parameter or return "undefined"
function getQueryParameter(event: APIGatewayProxyEvent, name: string) {
  const queryParams = event.queryStringParameters
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

// Encode last evaluated key using
export function encodeNextKey(lastEvaluatedKey: any) {
  if (!lastEvaluatedKey) {
    return null
  }

  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}