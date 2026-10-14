import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import studentLimits from './student-limits'
import studentAccounts from './student-accounts'
/**
* @see \App\Http\Controllers\ParentDashboardController::dashboard
 * @see app/Http/Controllers/ParentDashboardController.php:16
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
* @see \App\Http\Controllers\ParentDashboardController::dashboard
 * @see app/Http/Controllers/ParentDashboardController.php:16
 * @route '/parent/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ParentDashboardController::dashboard
 * @see app/Http/Controllers/ParentDashboardController.php:16
 * @route '/parent/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ParentDashboardController::dashboard
 * @see app/Http/Controllers/ParentDashboardController.php:16
 * @route '/parent/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})
const parent = {
    dashboard: Object.assign(dashboard, dashboard),
studentLimits: Object.assign(studentLimits, studentLimits),
studentAccounts: Object.assign(studentAccounts, studentAccounts),
}

export default parent