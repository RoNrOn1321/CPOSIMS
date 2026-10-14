import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ParentDashboardController::index
 * @see app/Http/Controllers/ParentDashboardController.php:16
 * @route '/parent/dashboard'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/parent/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ParentDashboardController::index
 * @see app/Http/Controllers/ParentDashboardController.php:16
 * @route '/parent/dashboard'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ParentDashboardController::index
 * @see app/Http/Controllers/ParentDashboardController.php:16
 * @route '/parent/dashboard'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ParentDashboardController::index
 * @see app/Http/Controllers/ParentDashboardController.php:16
 * @route '/parent/dashboard'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const ParentDashboardController = { index }

export default ParentDashboardController