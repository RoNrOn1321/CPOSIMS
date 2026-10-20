import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import dashboard074181 from './dashboard'
import products from './products'
import auditLogs from './audit-logs'
import reports from './reports'
import students from './students'
import parents from './parents'
import settings from './settings'
/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DashboardController::dashboard
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})
const admin = {
    dashboard: Object.assign(dashboard, dashboard074181),
products: Object.assign(products, products),
auditLogs: Object.assign(auditLogs, auditLogs),
reports: Object.assign(reports, reports),
students: Object.assign(students, students),
parents: Object.assign(parents, parents),
settings: Object.assign(settings, settings),
}

export default admin