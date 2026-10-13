import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
 * @see routes/web.php:43
 * @route '/parent/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/parent/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:43
 * @route '/parent/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
 * @see routes/web.php:43
 * @route '/parent/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
 * @see routes/web.php:43
 * @route '/parent/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})
const parent = {
    dashboard: Object.assign(dashboard, dashboard),
}

export default parent