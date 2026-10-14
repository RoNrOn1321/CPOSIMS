import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
import users from './users'
import categories from './categories'
/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\SettingController::index
 * @see app/Http/Controllers/Admin/SettingController.php:23
 * @route '/admin/settings'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const settings = {
    index: Object.assign(index, index),
users: Object.assign(users, users),
categories: Object.assign(categories, categories),
}

export default settings