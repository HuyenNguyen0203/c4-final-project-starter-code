import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { searchTodoFuntion } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const searchValue: string = JSON.parse(event.body)?.searchValue
        // TODO: search todos item by string value
        const userId = getUserId(event)
        const items = await searchTodoFuntion(userId, searchValue)
        return {
            statusCode: 200,
            body: JSON.stringify({
                items
            })
        }
    }
)

handler.use(httpErrorHandler()).use(
    cors({
        credentials: true
    })
)