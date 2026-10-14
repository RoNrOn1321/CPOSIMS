import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import student from './student'
import transactions from './transactions'
/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/pos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PosController::index
 * @see app/Http/Controllers/PosController.php:23
 * @route '/pos'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PosCheckoutController::__invoke
 * @see app/Http/Controllers/PosCheckoutController.php:22
 * @route '/pos/checkout'
 */
export const checkout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

checkout.definition = {
    methods: ["post"],
    url: '/pos/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PosCheckoutController::__invoke
 * @see app/Http/Controllers/PosCheckoutController.php:22
 * @route '/pos/checkout'
 */
checkout.url = (options?: RouteQueryOptions) => {
    return checkout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosCheckoutController::__invoke
 * @see app/Http/Controllers/PosCheckoutController.php:22
 * @route '/pos/checkout'
 */
checkout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BalanceTopupController::topup
 * @see app/Http/Controllers/BalanceTopupController.php:95
 * @route '/pos/topup'
 */
export const topup = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(options),
    method: 'post',
})

topup.definition = {
    methods: ["post"],
    url: '/pos/topup',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BalanceTopupController::topup
 * @see app/Http/Controllers/BalanceTopupController.php:95
 * @route '/pos/topup'
 */
topup.url = (options?: RouteQueryOptions) => {
    return topup.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BalanceTopupController::topup
 * @see app/Http/Controllers/BalanceTopupController.php:95
 * @route '/pos/topup'
 */
topup.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: topup.url(options),
    method: 'post',
})
const pos = {
    index: Object.assign(index, index),
student: Object.assign(student, student),
checkout: Object.assign(checkout, checkout),
topup: Object.assign(topup, topup),
transactions: Object.assign(transactions, transactions),
}

export default pos