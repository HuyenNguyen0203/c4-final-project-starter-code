import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('TodoAccess')
const attachmentUtils = new AttachmentUtils()
const todosAccess = new TodosAccess()

// Get todo function
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info('Get todos for user function called.')
  return todosAccess.getAllTodos(userId)
}

// Create todo function
export async function createTodo(
  newTodo: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('Create todo function called')

  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()
  const newItem = {
    userId,
    todoId,
    createdAt,
    done: false,
    attachmentUrl: null,
    ...newTodo
  }

  return await todosAccess.createTodoItem(newItem)
}

// Update todo function
export async function updateTodo(
  userId: string,
  todoId: string,
  todoUpdate: UpdateTodoRequest
): Promise<TodoUpdate> {
  logger.info('Update todo function called')
  return await todosAccess.updateTodoItem(userId, todoId, todoUpdate)
}

// Delete todo function
export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<string> {
  logger.info('Delete todo function called')
  return todosAccess.deleteTodoItem(userId, todoId)
}

// Create attachment function
export async function createAttachmentPresignedUrl(
  userId: string,
  todoId: string
) {
  logger.info('Create attachment function called')
  todosAccess.updateTodoAttachmentUrl(userId, todoId)
  return attachmentUtils.getUploadUrl(todoId)
}

// Pagination todo function
export async function getTodosWithPagination(
  userId: string,
  nextKey: JSON,
  limit: number
) {
  logger.info('Pagination todo function called')
  return await todosAccess.getTodoItemWithPagination(userId, nextKey, limit)
}

// Search todo function
export async function searchTodoFuntion(userId: string, searchValue: string): Promise<TodoItem[]> {
  logger.info('Search todos for user function called.')
  return todosAccess.searchTodos(userId, searchValue)
}