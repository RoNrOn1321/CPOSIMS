import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\StudentAccountController::search
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/admin/parents/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::search
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\StudentAccountController::search
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\StudentAccountController::search
 * @see app/Http/Controllers/Admin/StudentAccountController.php:135
 * @route '/admin/parents/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})
const parents = {
    search: Object.assign(search, search),
}

export default parents