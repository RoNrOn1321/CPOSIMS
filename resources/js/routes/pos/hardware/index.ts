import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PosController::status
 * @see app/Http/Controllers/PosController.php:151
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
 * @see app/Http/Controllers/PosController.php:151
 * @route '/pos/hardware-status'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::status
 * @see app/Http/Controllers/PosController.php:151
 * @route '/pos/hardware-status'
 */
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PosController::status
 * @see app/Http/Controllers/PosController.php:151
 * @route '/pos/hardware-status'
 */
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PosController::print
 * @see app/Http/Controllers/PosController.php:212
 * @route '/pos/hardware-print'
 */
export const print = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: print.url(options),
    method: 'post',
})

print.definition = {
    methods: ["post"],
    url: '/pos/hardware-print',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PosController::print
 * @see app/Http/Controllers/PosController.php:212
 * @route '/pos/hardware-print'
 */
print.url = (options?: RouteQueryOptions) => {
    return print.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::print
 * @see app/Http/Controllers/PosController.php:212
 * @route '/pos/hardware-print'
 */
print.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: print.url(options),
    method: 'post',
})
const hardware = {
    status: Object.assign(status, status),
print: Object.assign(print, print),
}

export default hardware