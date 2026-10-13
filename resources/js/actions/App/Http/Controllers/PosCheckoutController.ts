import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PosCheckoutController::__invoke
 * @see app/Http/Controllers/PosCheckoutController.php:22
 * @route '/pos/checkout'
 */
const PosCheckoutController = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: PosCheckoutController.url(options),
    method: 'post',
})

PosCheckoutController.definition = {
    methods: ["post"],
    url: '/pos/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PosCheckoutController::__invoke
 * @see app/Http/Controllers/PosCheckoutController.php:22
 * @route '/pos/checkout'
 */
PosCheckoutController.url = (options?: RouteQueryOptions) => {
    return PosCheckoutController.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosCheckoutController::__invoke
 * @see app/Http/Controllers/PosCheckoutController.php:22
 * @route '/pos/checkout'
 */
PosCheckoutController.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: PosCheckoutController.url(options),
    method: 'post',
})
export default PosCheckoutController