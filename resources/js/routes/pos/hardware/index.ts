import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PosController::status
 * @see app/Http/Controllers/PosController.php:135
 * @route '/pos/hardware-status'
 */
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/pos/hardware-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::status
 * @see app/Http/Controllers/PosController.php:135
 * @route '/pos/hardware-status'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::status
 * @see app/Http/Controllers/PosController.php:135
 * @route '/pos/hardware-status'
 */
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PosController::status
 * @see app/Http/Controllers/PosController.php:135
 * @route '/pos/hardware-status'
 */
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})
const hardware = {
    status: Object.assign(status, status),
}

export default hardware