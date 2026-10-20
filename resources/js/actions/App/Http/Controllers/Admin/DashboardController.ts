import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
const index35f58437d9250c39f332f5e8e70440b7 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index35f58437d9250c39f332f5e8e70440b7.url(options),
    method: 'get',
})

index35f58437d9250c39f332f5e8e70440b7.definition = {
    methods: ["get","head"],
    url: '/admin',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
index35f58437d9250c39f332f5e8e70440b7.url = (options?: RouteQueryOptions) => {
    return index35f58437d9250c39f332f5e8e70440b7.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
index35f58437d9250c39f332f5e8e70440b7.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index35f58437d9250c39f332f5e8e70440b7.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin'
 */
index35f58437d9250c39f332f5e8e70440b7.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index35f58437d9250c39f332f5e8e70440b7.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin/dashboard'
 */
const index750aeb224105761400ee952169bd178c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index750aeb224105761400ee952169bd178c.url(options),
    method: 'get',
})

index750aeb224105761400ee952169bd178c.definition = {
    methods: ["get","head"],
    url: '/admin/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin/dashboard'
 */
index750aeb224105761400ee952169bd178c.url = (options?: RouteQueryOptions) => {
    return index750aeb224105761400ee952169bd178c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin/dashboard'
 */
index750aeb224105761400ee952169bd178c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index750aeb224105761400ee952169bd178c.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DashboardController::index
 * @see app/Http/Controllers/Admin/DashboardController.php:22
 * @route '/admin/dashboard'
 */
index750aeb224105761400ee952169bd178c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index750aeb224105761400ee952169bd178c.url(options),
    method: 'head',
})

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\DashboardController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/admin': index35f58437d9250c39f332f5e8e70440b7,
    '/admin/dashboard': index750aeb224105761400ee952169bd178c,
}

const DashboardController = { index }

export default DashboardController