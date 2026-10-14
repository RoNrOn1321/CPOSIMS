import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PosController::voidMethod
 * @see app/Http/Controllers/PosController.php:193
 * @route '/pos/transactions/{transaction}/void'
 */
export const voidMethod = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: voidMethod.url(args, options),
    method: 'post',
})

voidMethod.definition = {
    methods: ["post"],
    url: '/pos/transactions/{transaction}/void',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PosController::voidMethod
 * @see app/Http/Controllers/PosController.php:193
 * @route '/pos/transactions/{transaction}/void'
 */
voidMethod.url = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { transaction: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { transaction: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    transaction: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        transaction: typeof args.transaction === 'object'
                ? args.transaction.id
                : args.transaction,
                }

    return voidMethod.definition.url
            .replace('{transaction}', parsedArgs.transaction.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PosController::voidMethod
 * @see app/Http/Controllers/PosController.php:193
 * @route '/pos/transactions/{transaction}/void'
 */
voidMethod.post = (args: { transaction: number | { id: number } } | [transaction: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: voidMethod.url(args, options),
    method: 'post',
})
const transactions = {
    void: Object.assign(voidMethod, voidMethod),
}

export default transactions