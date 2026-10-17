import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PosController::lookup
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
export const lookup = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lookup.url(options),
    method: 'get',
})

lookup.definition = {
    methods: ["get","head"],
    url: '/pos/student-lookup',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::lookup
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
lookup.url = (options?: RouteQueryOptions) => {
    return lookup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::lookup
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
lookup.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lookup.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PosController::lookup
 * @see app/Http/Controllers/PosController.php:101
 * @route '/pos/student-lookup'
 */
lookup.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lookup.url(options),
    method: 'head',
})
const student = {
    lookup: Object.assign(lookup, lookup),
}

export default student